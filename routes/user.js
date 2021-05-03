const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

//INSERE UM USUARIO
router.post('/cadastro', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        conn.query(
            'INSERT INTO users (email, senha) VALUES (?,?)',
            [req.body.email ,req.body.senha],
            (error, results) =>{
                conn.release();
        
                if(error){return res.status(500).send({error: error})}

                response = {
                    mensagem: 'Usuario criado com sucesso',
                    usuarioCriado: {
                        userId: results.insertId,
                        email: req.body.email
                    }
                }
                        res.status(201).send(response);
            }
        )    
        
        })    
})
router.post('/login',(req,res,next)=>{
    mysql.getConnection((error,conn)=>{
        if(error){return res.status(500).send({error: error})}
        const query = `SELECT * FROM users WHERE email =?`;
        conn.query(query,[req.body.email],(error,results,fields)=>{
            conn.release();
            if(error){ return  res.status(500).send({error: error})};
            if(results.length === 0){
                return res.status(404).send ({message: 'E-mail  não encontrado' })
            };
            if(req.body.senha === results[0].senha){
                return res.status(200).send({message: 'Autenticado com sucesso'})
            }else{
                return res.status(401).send({message: 'Falha na Autenticação'})
            }
        
        })
    })
})


module.exports = router;