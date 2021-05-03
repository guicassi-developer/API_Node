const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

//INSERE UM USUARIO
router.post('/cadastro', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){return res.status(500).send({message: error})}
        conn.query('SELECT * FROM users WHERE email = ?',[req.body.email], (error,results)=>{
            if(error){return res.status(500).send({message: error})}
            if(results.length > 0){
                res.status(409).send({message: 'Usuário já cadastrado'})
            }else{
                bcrypt.hash(req.body.senha, 10,(errBcrypt, hash)=>{
                    if(errBcrypt){return res.status(500).send({ error : errBcrypt})}
                    conn.query(
                        'INSERT INTO users (email, senha) VALUES (?,?)',
                        [req.body.email ,hash],
                        (error, results) =>{
                            conn.release();
                    
                            if(error){return res.status(500).send({error: error})}
            
                            const token = jwt.sign({
                                userId: results.insertId,
                                email: req.body.email
                            },process.env.JWT_KEY,
                            {
                                expiresIn: '1h'
                            })
    
                            res.status(201).send({token: token});
                        }
                    );    
                });  
            };      
        });                  
    });
});
router.post('/login',(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        if(error){return res.status(500).send({error: error})}
        const query = `SELECT * FROM users WHERE email =?`;
        conn.query(query,[req.body.email],(error,results,fields)=>{
            conn.release();
            if(error){ return  res.status(500).send({error: error})};
            if(results.length === 0){
                return res.status(401).send ({message: 'E-mail  não encontrado' })
            };
            bcrypt.compare(req.body.senha, results[0].senha,(err,result)=>{
                if(err){
                    return res.status(401).send({message: 'Falha na auteticação'})
                }
                if(result){
                    const token = jwt.sign({
                        userId: results[0].userId,
                        email: results[0].email
                    },process.env.JWT_KEY,
                    {
                        expiresIn: '1h'
                    })
                    return res.status(200).send({
                        //message:'Autenticado com sucesso',
                        token  :token                            
                    })
                }
                return res.status(401).send({message:'Falha na autenticação'})
            })
        
        });
    });
});

module.exports = router;