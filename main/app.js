require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
const register = require('./register');
const multer = require('multer');
const app = express();

// Domains that can only access the API
app.use(cors({
  origin: ['http://localhost:3000']
}));

// Registering static folder
app.use('/static', express.static('./storage/public/static'));


// Registering middlewares for request body 
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Registering Handlebars template engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Registering all global helpers
register.helpers();

// Registering middleware for File Upload
app.use(multer().any());

// Registering all event and listeners
register.registerEvents(app);

// Registering all group routes 
register.registerRoutes(app);

// Registering global error handling middleware
app.use(middleware('error.handle'));

module.exports = app;
