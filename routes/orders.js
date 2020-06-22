const express = require('express');
const mysql = require('../src/mysql').pool

const router = express.Router();

const logPattern = require('../utils/logpattern.json')

router.get('/', (req, res) => {
    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            'SELECT * FROM orders',
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});
                const response = {
                    tipo:'GET',
                    length: result.length,
                    descricao: 'RETORNA TODOS OS PEDIDOS',
                    pedidos: result.map( order => {
                        return {
                            id: order.id,
                            idProduto: order.idProduct,
                            quantidade: order.quantity,
                            visualizar: {
                                tipo:'GET',
                                descricao:'DETALHA UM PEDIDO',
                                url:'http://localhost:3000/products/' + order.id
                            }
                        }
                    })
                };
                return res.status(200).send(response);
            }
        )
    });
});

router.get('/:orderId', (req, res) => {
    const id = req.params.orderId;
    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            `SELECT * FROM orders WHERE id=${id}`,
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});

                if( result.length <= 0) {
                    return res.status(404).send( logPattern.orderNotFound )
                }

                result = result[0]
                const response = {
                    tipo:'GET',
                    descricao:'DETALHES PEDIDO',
                    pedido: {
                        id: result.id,
                        idProduto:result.idProduct,
                        visualizar: {
                            tipo:'GET',
                            descricao:'DETALHA UM PRODUTO',
                            url:'http://localhost:3000/products'
                        }
                    }
                }
                
                return res.status(200).send( response );
            }
        )
    });
});

router.post('/', (req, res) => {
    mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            'INSERT INTO orders(idProduct, quantity	) VALUES(?,?)',
            [req.body.idProduct, req.body.quantity ],
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});

                const response = {
                    mensagem:'PEDIDO INSERIDO COM SUCESSO',
                    tipo:'POST',
                    descricao:'INSERE UM PEDIDO',
                    produtoCriado: {
                        id: result.id,
                        nome:req.body.name,
                        preco:req.body.value,
                        visualizar: {
                            tipo:'GET',
                            descricao:'DETALHES TODOS OS PEDIDOS',
                            url:'http://localhost:3000/orders'
                        }
                    }
                }

                return res.status(201).send( response );
            }
        )
    });
});

router.delete('/:orderId', (req, res) => {
    const id = req.params.orderId;
    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).send({error:error, response:null})
        conn.query(
            `DELETE FROM orders  WHERE id=${id}`,
            (error, result) => {
                conn.release();
                if(error)return res.status(500).send({error:error,response:null});
                if(result.affectedRows <= 0)return res.status(404).send( logPattern.orderNotFound )

                const response = {
                    mensagem:'PEDIDO DELETADO COM SUCESSO',
                    tipo:'DELETE',
                    descricao:'DELETA UM PEDIDO',
                    produtoDeletado: {
                        id: id,
                        visualizar: {
                            tipo:'POST',
                            descricao:'INSERE UM PRODUTO',
                            url:'http://localhost:3000/orders',
                            body:{
                                idProduct:'int',
                                quantity:'int'
                            }
                        }
                    }
                };

                return res.status(202).send( response );
            }
        )
    });
});







module.exports = router 