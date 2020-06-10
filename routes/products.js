const express = require('express');

const router = express.Router();
const products = [];


router.post('/', (req, res, next) => {
    res.status(200).send({
        message:'WELCOME !, YOU ARE IN PRODUCTS PAGE !'
    });
});

router.put('/', (req, res, next) => {
    const product = {
        name:req.body.name,
        value:req.body.value,
        createdat:getCurrentDate(),
        id: generateId( products ).toString()
    };
    products.push( product )
    res.status(201).send({
        message:'product created',
        product: product 
    });
});

router.get('/getall', (req, res, next) => {
    res.send({
        products: products
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const [product] = products.filter( (product) => product.id === id );
    if(product){
        res.status(200).send( product );
    }else{
        res.status(200).send({
            error:'Product Not Found'
        });
    }
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const [product] = products.filter( (product) => product.id === id )
    try {
        res.status(200).send( {message:'Update With Sucess'} );
    } catch (error) {
        res.status(200).send( {message:'Failed In Delete'} );
    }
});


router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const [product] = products.filter( (product) => product.id === id );
    try {
        products.splice( products.indexOf( product ), 1 );
        res.status(200).send( {message:'Sucess In Delete'} );
    } catch (error) {
        res.status(200).send( {message:'Failed In Delete'} );
    }
});




function getCurrentDate(){
    return( '2020-06-09 10:10' )
}

function generateId( products, maxWidth = 999999999 ){
    let id = Math.floor( Math.random() * maxWidth );
    let [hasIdInProduct] = products.filter( product => product.id === id );
    return hasIdInProduct?generateId( products ):id;
}

module.exports = router 