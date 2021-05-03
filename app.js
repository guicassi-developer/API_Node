const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotaUser = require ('./routes/user');
//const rotaUserLogin = require ('./routes/userLogin');


//O morgan retorna no terminal o estado de pesquisa das rotas
app.use(morgan('dev'));

//Apenas dados simples
app.use(bodyParser.urlencoded({ extended: false }));

//json de entrada no body
app.use(bodyParser.json());

app.use((res,req,next)=>{
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Header',
     'Origin, X-Requrested-With, Content-Type, Accept, Authorization'
    );

    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }

    next();
})

//Rotas a serem encontradas
app.use('/user',rotaUser);
//app.use('/user',rotaUserLogin);


//Quando não encontra a rota, entra aqui:
app.use((res,req,next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    return res.send({
        erro: {
            message: error.message
        }
    })
});

module.exports = app;