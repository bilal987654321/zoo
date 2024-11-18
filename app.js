var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwtAuth = require('./middleware/auth');
var indexRouter = require('./routes/tools');
var index1Router = require('./routes/index');
var authRouter = require('./routes/auth');
var apiRouter = require('./routes/api');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(jwtAuth);  
app.use((req, res, next) => {
  res.locals.user = req.user;  
  next();
});

app.use('/', index1Router);
app.use('/tools', indexRouter);
app.use('/api', apiRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://bil98765:passpasspass@cluster0.adlpi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err)
  res.status(err.status || 500);
});

module.exports = app;
