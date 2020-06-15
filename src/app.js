const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use( morgan('dev') );
app.use( bodyParser.urlencoded({ extended: false }) );
app.use( bodyParser.json() );
app.use(cors( {
    origin:'*',
    methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['Origin, X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
} ))

const productsRoute = require('../routes/products');

app.use('/products', productsRoute);

app.use((req, res, next)=> {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use( (error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        error:{
            message: error.message
        }
    });
});


module.exports = app;