const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use('/uploads', express.static('uploads'));

app.use( morgan('dev') );
app.use( bodyParser.urlencoded({ extended: false }) );
app.use( bodyParser.json() );
app.use(cors( {
    origin:'*',
    methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['Origin, X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
} ))



const productsRoute = require('../routes/products');
const ordersRoute = require('../routes/orders');
const usersRoute = require('../routes/users');

app.use('/products', productsRoute);
app.use('/orders', ordersRoute);
app.use('/users', usersRoute);

app.use((req, res, next)=> {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use( (error, req, res, next) => {
    res.status(error.status || 500);
    return res.json({
        error:{
            message: error.message
        }
    });
});


module.exports = app;