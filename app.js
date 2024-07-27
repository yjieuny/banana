require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { AppDataSource } = require('./api/models/dataSource');
const { routes } = require('./api/routes/index');
const { globalErrorHandler } = require('./api/utils/error');

const fs = require('fs').promises;
const HLSServer = require('hls-server');
const http = require('http');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const VideoEntity = require('./api/models/video');

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(routes);
app.use(globalErrorHandler);

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const PORT = process.env.PORT;

// 서버 및 HLS 서버 생성
const server = http.createServer(app);
const hls = new HLSServer(server, {
  provider: {
    exists: async (req, cb) => {
      const filePath = path.join(__dirname, req.url);
      try {
        await fs.access(filePath, fs.constants.F_OK);
        cb(null, true);
      } catch (error) {
        cb(null, false);
      }
    },
    getManifestStream: (req, cb) => {
      const filePath = path.join(__dirname, req.url);
      cb(null, fs.createReadStream(filePath));
    },
    getSegmentStream: (req, cb) => {
      const filePath = path.join(__dirname, req.url);
      cb(null, fs.createReadStream(filePath));
    },
  },
});

const hlsPORT = 8000;
server.listen(hlsPORT, () => {
  console.log(`The HLS server is running on port ${hlsPORT}`);
});

// 기본 경로에서 HLS 서버 실행
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

// 비디오 회전 메타데이터 확인 함수
async function checkVideoRotation(filePath) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream_tags=rotate -of default=nw=1:nk=1 "${filePath}"`
    );
    return stdout.trim();
  } catch (error) {
    console.error('Error checking video rotation:', error);
    return null;
  }
}

// MP4 파일을 HLS로 변환하고 데이터베이스에 저장하는 기능
const convertVideo = async () => {
  const mp4FolderPath = path.join(__dirname, 'mp4');
  const hlsFolderPath = path.join(__dirname, 'hls');

  // mp4와 hls 폴더가 없으면 생성
  for (const dir of [mp4FolderPath, hlsFolderPath]) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error(`Error creating directory ${dir}:`, error);
      }
    }
  }

  try {
    const files = await fs.readdir(mp4FolderPath);

    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.mp4') {
        const inputFilePath = path.join(mp4FolderPath, file);
        const outputFileName = path.basename(file, '.mp4');
        const outputHLSPath = path.join(hlsFolderPath, outputFileName);

        const rotation = await checkVideoRotation(inputFilePath);
        let command;

        if (rotation === '90') {
          command = `ffmpeg -i "${inputFilePath}" -vf "transpose=1" -codec:a copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputHLSPath}.m3u8"`;
        } else {
          command = `ffmpeg -i "${inputFilePath}" -codec:v copy -codec:a copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputHLSPath}.m3u8"`;
        }

        try {
          const { stdout, stderr } = await execAsync(command);
          console.log('FFmpeg output:', stdout);
          if (stderr) console.error('FFmpeg stderr:', stderr);

          const videoUrl = `https://store.brnana.store/hls/${encodeURIComponent(
            outputFileName
          )}.m3u8`;
          const video = new VideoEntity();
          video.video_url = videoUrl;
          await AppDataSource.manager.save(video);
          console.log(`Video converted and saved to DB: ${videoUrl}`);
        } catch (error) {
          console.error(
            'Error during conversion or saving to DB:',
            error.message
          );
          if (error.stderr) console.error('FFmpeg stderr:', error.stderr);
        }
      }
    }
  } catch (error) {
    console.error('Error reading mp4 directory:', error);
  }
};

// API 엔드포인트: 비디오 URL 목록 제공
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await AppDataSource.manager.find(VideoEntity);
    res.json(videos.map((video) => video.video_url));
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 서버 시작
app.listen(PORT, async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    await convertVideo();

    console.log(`Listening to request on port: ${PORT}`);
  } catch (error) {
    console.error('Error during initialization or video conversion:', error);
    process.exit(1);
  }
});
