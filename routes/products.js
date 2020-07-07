const express = require('express');
const mysql = require('../src/mysql').pool
const multer = require('multer');

const {getCurrentTime} = require('../utils/scripts')
const logPattern = require('../utils/logpattern.json')

const storage = multer.diskStorage({
    destination: function( req, file, cb ){
        cb(null, './uploads');
    },
    filename: function( req, file, cb ){
        cb(null, new Date().toISOString() +'-'+ file.originalname);
    }
});

function fileFilter( req, file, cb){
    if(file.mimetype === 'image/png' || file.mimetype === 'image.jpeg'){
        return cb(null, true);
    }
    cb(null, false);
}
const upload = multer( {
    storage:storage,
    limits:{
        fileSize: (1024 * 1024) * 5
    },
    fileFilter: fileFilter,
});

const router = express.Router();

router.get('/', (req, res) => {
    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            'SELECT * FROM products',
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});
                const response = {
                    tipo:'GET',
                    length: result.length,
                    descricao: 'RETORNA TODOS OS PRODUTOS',
                    products: result.map( prod => {
                        return {
                            id: prod.id,
                            nome: prod.name,
                            preco: prod.value,
                            imageUrl:prod.product_img,
                            criadoEm: prod['dateCreated'] + ' ' + prod['hourCreated'],
                            visualizar: {
                                tipo:'GET',
                                descricao: 'RETORNA UM PRODUTO',
                                url: 'http://localhost:3000/products/'
                            }
                        }
                    })
                };
                return res.status(200).send(response);
            }

            
        )
    });
});

router.get('/:productId', (req, res) => {
    const id = req.params.productId;
    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            `SELECT * FROM products WHERE id=${id}`,
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});

                if( result.length <= 0) {
                    return res.status(404).send( logPattern.productNotFound )
                }
                result = result[0]
                const response = {
                    tipo:'GET',
                    descricao:'DETALHES PRODUTO',
                    produto: {
                        id: result.id,
                        nome:result.name,
                        preco: result.value,
                        imageUrl:prod.product_img,
                        criadoEm: result['dateCreated'] + ' ' + result['hourCreated'],
                        visualizar: {
                            tipo:'GET',
                            descricao:'DETALHA UM PRODUTO',
                            url:'http://localhost:3000/products/[id]'
                        }
                    }
                }
                
                return res.status(200).send( response );
            }
        )
    });
});

router.post('/', upload.single('imgProduct'), (req, res) => {

    mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            'INSERT INTO products(name, value, dateCreated, hourCreated, product_img) VALUES(?,?,?,?, ?)',
            [req.body.name, req.body.value, getCurrentTime().currentDate, getCurrentTime().currentTime, req.file.path ],
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});

                const response = {
                    mensagem:'PRODUTO INSERIDO COM SUCESSO',
                    tipo:'POST',
                    descricao:'INSERE UM PRODUTO',
                    produtoCriado: {
                        id: result.id,
                        nome:req.body.name,
                        preco:req.body.value,
                        imageUrl: req.file.path,
                        visualizar: {
                            tipo:'GET',
                            descricao:'DETALHES TODOS OS PRODUTOS',
                            url:'http://localhost:3000/products'
                        }
                    }
                }

                return res.status(201).send( response );
            }
        )
    });
});

router.delete('/:productId', (req, res) => {
    const id = req.params.productId;
    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            `DELETE FROM products  WHERE id=${id}`,
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});
                if(result.affectedRows <= 0)return res.status(404).send( logPattern.productNotFound )

                const response = {
                    mensagem:'PRODUTO DELETADO COM SUCESSO',
                    tipo:'DELETE',
                    descricao:'DELETA UM PRODUTO',
                    produtoDeletado: {
                        id: id,
                        visualizar: {
                            tipo:'POST',
                            descricao:'INSERE UM PRODUTO',
                            url:'http://localhost:3000/products',
                            body:{
                                name:'string',
                                value:'int'
                            }
                        }
                    }
                };

                return res.status(202).send( response );
            }
        )
    });
});

router.delete('/', (req, res) => {
    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            `DELETE FROM products`,
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});
                if(result.affectedRows <= 0)return res.status(404).send( logPattern.productsNotFound )

                const response = {
                    mensagem:'PRODUTOS DELETADOS COM SUCESSO',
                    tipo:'DELETE',
                    descricao:'DELETA TODOS OS PRODUTO',
                    adicionarProduto: {
                        visualizar: {
                            tipo:'POST',
                            descricao:'INSERE UM PRODUTO',
                            url:'http://localhost:3000/products',
                            body:{
                                name:'string',
                                value:'int'
                            }
                        }
                    }
                };

                return res.status(202).send( response );
            }
        )
    });
});



router.patch('/:productId', (req, res) => {
    const id = req.params.productId;
    return mysql.getConnection( (error, conn) => {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            `UPDATE products SET name = "${req.body.name}", value = ${req.body.value} WHERE id = ${id};`,
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});
                if(result.affectedRows <= 0)return res.status(404).send( logPattern.productNotFound )

                const response = {
                    mensagem:'PRODUTO ATUALIZADO COM SUCESSO',
                    tipo:'PATCH',
                    descricao:'ATUALIZA UM PRODUTO',
                    produtoAtualizado: {
                        id: id,
                        nome:req.body.name,
                        preco:req.body.value,
                        visualizar: {
                            tipo:'GET',
                            descricao:'DETALHE OS PRODUTOS',
                            url:'http://localhost:3000/products'
                        }
                    }
                };

                return res.status(200).send( response );
            }
        )
    });
});

module.exports = router;