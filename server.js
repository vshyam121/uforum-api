const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');

//Load env vars
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

//Route files
const auth = require('./routes/auth');
const forums = require('./routes/forums');
const threads = require('./routes/threads');
const users = require('./routes/users');

const app = express();

app.use(express.json());
app.use(cookieParser());

//CORS set with credentials and corresponding frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true,
  })
);

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_DOMAIN);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Mount routers
app.use('/api/auth', auth);
app.use('/api/forums', forums);
app.use('/api/threads', threads);
app.use('/api/users', users);

//Middleware to handle common errors
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle unhandled promise rejections
process.on('unhandledRejection', (error, promise) => {
  console.log(`Error: ${error.message}`.red);

  //Close server and exit process
  server.close(() => process.exit(1));
});
