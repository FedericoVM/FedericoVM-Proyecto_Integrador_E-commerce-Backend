const express = require("express")
const conectarBD = require("./dataBase");
const app = express()

require("dotenv").config();

const PORT = 4000;

conectarBD()


app.listen(PORT,() => {
    console.log(`El servidor esta escuchando en el puerto ${PORT}`);
} )