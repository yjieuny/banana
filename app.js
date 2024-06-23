require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
//const dotenv = require('dotenv');

//const { DataSource } = require('typeorm');
const { AppDataSource } = require('./api/models/dataSource');
const { routes } = require('./api/routes/index');
const { globalErrorHandler } = require('./api/utils/error');

const app = express();

//dotenv.config();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(routes);
app.use(globalErrorHandler);

app.get('/ping', function (req, res, next) {
  res.json({ message: 'pong' });
});

// app.listen(3000, function () {
//   console.log('server listening on port 3000');
// });

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  await AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((error) => {
      console.error('Error during Data Source initialization', error);
    });
  console.log(`Listening to request on port: ${PORT}`);
});
