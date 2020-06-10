const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const productsRoute = require('../routes/products');
/*
app.use( (req, res, next) => {
    res.header('Acess-Control-Allow-Origin', '*');
    res.header('Acess-Control-Allow-Header',
     'Origin, X-Requested-Width, Content-Type','Accept', 'Authorization'
     );

    if(req.method === 'OPTIONS'){
        res.header('Acess-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).send({})
    }
});*/

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