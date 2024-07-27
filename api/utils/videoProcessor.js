// // utils/videoProcessor.js
// require('dotenv').config();

// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');
// const AWS = require('aws-sdk');
// const { v4: uuidv4 } = require('uuid');

// // AWS 설정
// AWS.config.update({
//   accessKeyId: process.env.ACCESS_KEY,
//   secretAccessKey: process.env.SECRET_ACCESS_KEY,
//   region: process.env.BUCKET_REGION,
// });

// const s3 = new AWS.S3();

// async function convertAndUpload(inputFile) {
//   const outputDir = path.join(__dirname, '..', 'temp', uuidv4());
//   const outputFile = path.join(outputDir, 'output.m3u8');

//   // 디렉토리 생성
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//   }

//   // ffmpeg 명령어
//   const ffmpegCommand = `ffmpeg -i ${inputFile} -c:v libx264 -preset fast -crf 22 -c:a aac -vf "transpose=1" -hls_time 10 -hls_list_size 0 -hls_segment_filename ${outputDir}/segment%d.ts ${outputFile}`;

//   // ffmpeg 실행
//   await new Promise((resolve, reject) => {
//     exec(ffmpegCommand, (error, stdout, stderr) => {
//       if (error) reject(error);
//       else resolve();
//     });
//   });

//   // S3에 업로드
//   const files = fs.readdirSync(outputDir);
//   for (const file of files) {
//     const fileContent = fs.readFileSync(path.join(outputDir, file));
//     const params = {
//       Bucket: process.env.BUCKET_NAME,
//       Key: `hls/${path.basename(outputDir)}/${file}`,
//       Body: fileContent,
//     };

//     await s3.upload(params).promise();
//   }

//   // 임시 파일 삭제
//   fs.rmdirSync(outputDir, { recursive: true });

//   // m3u8 파일의 S3 URL 반환
//   return `https://${
//     process.env.BUCKET_NAME
//   }.s3.amazonaws.com/hls/${path.basename(outputDir)}/output.m3u8`;
// }

// module.exports = { convertAndUpload };
