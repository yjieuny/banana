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
const AWS = require('aws-sdk');

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

// AWS 설정
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// S3에 파일 업로드 함수
async function uploadToS3(filePath, fileName) {
  console.log(`Attempting to upload file: ${filePath} to S3 as ${fileName}`);
  try {
    const fileContent = await fs.readFile(filePath);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `hls/${fileName}`,
      Body: fileContent,
    };

    console.log(`S3 upload params: ${JSON.stringify(params, null, 2)}`);

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          console.error(`S3 upload error for ${fileName}:`, err);
          reject(err);
        } else if (!data || !data.Location) {
          console.error(
            `S3 upload successful but no Location returned for ${fileName}`
          );
          reject(new Error('S3 upload successful but no Location returned'));
        } else {
          console.log(`S3 upload successful for ${fileName}: ${data.Location}`);
          resolve(data.Location);
        }
      });
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

// MP4 파일을 HLS로 변환하고 데이터베이스에 저장하는 기능
const convertVideo = async () => {
  const mp4FolderPath = path.resolve(__dirname, 'mp4');
  const hlsFolderPath = path.resolve(__dirname, 'hls');

  console.log('MP4 Folder Path:', mp4FolderPath);
  console.log('HLS Folder Path:', hlsFolderPath);

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
    console.log('Files in MP4 folder:', files);

    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.mp4') {
        const inputFilePath = path.join(mp4FolderPath, file);
        const outputFileName = path.basename(file, '.mp4');
        const outputHLSPath = path.join(hlsFolderPath, outputFileName);

        console.log('Input File Path:', inputFilePath);
        console.log('Output HLS Path:', outputHLSPath);

        try {
          await fs.mkdir(outputHLSPath, { recursive: true });
          console.log(`Created HLS output directory: ${outputHLSPath}`);

          // 회전 정보에 관계없이 항상 원본 그대로 변환
          const command = `ffmpeg -i "${inputFilePath}" -an -codec:v libx264 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${path.join(
            outputHLSPath,
            'index.m3u8'
          )}"`;

          console.log('FFmpeg command:', command);

          const { stdout, stderr } = await execAsync(command);
          console.log('FFmpeg output:', stdout);
          if (stderr) console.error('FFmpeg stderr:', stderr);

          const hlsFiles = await fs.readdir(outputHLSPath);
          console.log(`HLS files generated in ${outputHLSPath}:`, hlsFiles);

          // HLS 파일들을 S3에 업로드
          const s3Urls = await Promise.all(
            hlsFiles.map(async (hlsFile) => {
              const filePath = path.join(outputHLSPath, hlsFile);
              try {
                return await uploadToS3(
                  filePath,
                  `${outputFileName}/${hlsFile}`
                );
              } catch (error) {
                console.error(`Failed to upload ${hlsFile} to S3:`, error);
                return null;
              }
            })
          );

          const videoUrl = s3Urls.find((url) => url && url.endsWith('.m3u8'));
          if (videoUrl) {
            const video = new VideoEntity();
            video.video_url = videoUrl;
            await AppDataSource.manager.save(video);
            console.log(
              `Video converted, uploaded to S3, and saved to DB: ${videoUrl}`
            );
          } else {
            console.error('Failed to get a valid m3u8 URL from S3 uploads');
          }

          // 로컬의 HLS 파일들 삭제 (선택사항)
          await fs.rm(outputHLSPath, { recursive: true, force: true });
          console.log(`Removed local HLS files: ${outputHLSPath}`);
        } catch (error) {
          console.error('Detailed error:', error);
          console.error('Error stack:', error.stack);
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
