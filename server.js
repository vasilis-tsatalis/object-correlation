//module to create http server and api routes
const express = require('express');
// use the cloud db mongodb as a service (atlas cloud env)
// https://cloud.mongodb.com
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
//this file is used to hide the url connection from db
// other configuration data can be stored in that file
require('dotenv/config');
//create the app
const app = express();

//----------MIDDLEWARES----------//
//we are using them to execute some packages like below or ex auth
app.use(cors());
//set the public folder
//run on the root
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.json());
//read the body from request as json
app.use(bodyParser.json());

//----------Import Routes in Middleware----------//
//everytime the user calls /... the route will be redirected

const moviesRoute = require('./routes/movies');
app.use('/movie', moviesRoute);
const ratingsRoute = require('./routes/ratings');
app.use('/ratings', ratingsRoute);

//----------ROUTES Default----------//
//classic way
app.get('/api', async(req,res) => {
    res.send('Homepage API');
    console.log('default route called');
});

//----------RUN & CONNECT DB----------//
//connect to mongodb
//here is a promise
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true, useCreateIndex: true })
    .then(() => console.log('Connected to mongoDB'))
    .catch(err => console.log(err));

//nodejs run on this port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server listen on port: ${port}`);
});
