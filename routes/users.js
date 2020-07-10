const express = require('express');
const mysql = require('../src/mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const router = express.Router();

const logPattern = require('../utils/logpattern.json');

router.post('/signup', (req, res, next) => {

    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).json({error:error, response:null});

        conn.query('SELECT * FROM users WHERE email = ?', [req.body.email], 
        (error, result) => {
            
            if(error)return res.status(500).json({error:error, response:null});
            
            if(result.length > 0){
                conn.release();
                return res.status(409).json( {mensagem:'usuário já cadastrado'} )
            }else {
                return bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
                    conn.release();
                    if(errBcrypt)return res.status(500).json({error: errBcrypt});

                    conn.query(`INSERT INTO users(email, user_password) VALUES(?, ?)`, [req.body.email, hash],
                    (error, result)=>{
                        if(error)return res.status(500).json({error: error});
        
                        const response = {
                            mensagem:'Usuário criado com sucesso',
                            usuarioCriado: {
                                usuario_id:result.insertId,
                                email: req.body.email
                            }
                        }
        
                        return res.status(201).json(response);
                    })
                });
            }
            
        })

    });     

});

router.post('/signin', (req, res, next) => {
    return mysql.getConnection( (error, conn)=> {
        if(error)return res.status(500).json({error:error, response:null});

        const queryGetUserByEmail = 'SELECT * FROM users WHERE email = ?';

        conn.query(queryGetUserByEmail, [req.body.email], 
        (error, result) => {
            result = result[0];
            conn.release();
            
            if(error)return res.status(500).json({error:error, response:null});
            if(result.length < 1)return res.status(401).json({mensagem:'Falha na autenticação'});

            bcrypt.compare(req.body.password, result.user_password, (bcyptErr, bcyptResult) => {
                if(bcyptErr)return res.status(401).json({mensagem:'Falha na autenticação'});
                if(bcyptResult){
                    const token = jwt.sign({
                        userId:result.id,
                        email:result.email   
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn:"1h"  
                    }
                    );
                    return res.status(200).json({
                        mensagem:'Autenticado com sucesso',
                        token:token
                    });
                }
                return res.status(401).json({mensagem:'Falha na autenticação'});
            })
            
        })

    });
})


module.exports = router;
