const express = require("express");
const app = express();
const bodyParser= require('body-parser');
const conectarDB=require('./dataBase');
require("dotenv").config();
const AuthProductos = require("./routes/productos");
const PUERTO = 4321;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use('/api/productos',AuthProductos)

conectarDB();

app.listen(PUERTO, () => {
    console.log(`El servidor esta escuchando en el puerto ${PUERTO}`)
})