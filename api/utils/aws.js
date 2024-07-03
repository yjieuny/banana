const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

const getExtensionOfFile = (file) => {
  const fileName = file.originalname;
  const dotBeforeExtension = fileName.lastIndexOf('.');
  const lengthOfFileName = fileName.length;
  const extension = fileName.substring(dotBeforeExtension, lengthOfFileName);
  return extension;
};

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.BUCKET_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'brnana-bab-demo',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const extension = getExtensionOfFile(file);
      const fileName = `${Date.now().toString()}${extension}`;
      cb(null, fileName);
    },
  }),
});

module.exports = { upload };
