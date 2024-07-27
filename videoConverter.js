// videoConverter.js
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { createStoreReview } = require('./api/models/reviewDao');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// 비디오 변환 함수
async function convertVideo(
  inputPath,
  outputPath,
  userId,
  storeId,
  textReview
) {
  ffmpeg(inputPath, { timeout: 432000 })
    .addOptions([
      '-profile:v baseline',
      '-level 3.0',
      '-s 1280x720',
      '-start_number 0',
      '-hls_time 10',
      '-hls_list_size 0',
      '-f hls',
    ])
    .output(outputPath)
    .on('end', async () => {
      console.log('HLS 변환 완료!');
      const videoUrl = `http://localhost:8000/${outputPath}`; // HLS 비디오 URL
      try {
        const reviewId = await createStoreReview(
          userId,
          storeId,
          textReview,
          videoUrl
        );
        console.log('비디오 URL 저장 성공:', reviewId);
      } catch (error) {
        console.error('비디오 URL 저장 실패:', error);
      }
    })
    .on('error', (err) => {
      console.error('에러:', err);
    })
    .run();
}

module.exports = { convertVideo };
