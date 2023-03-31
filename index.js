const express = require("express");
const conectarBD = require("./dataBase");
const app = express()
const AuthRouter = require("./routes/auth")
const AuthProductos = require("./routes/productos");
require("dotenv").config();


const bodyParser = require("body-parser");

const PORT = 4000;

conectarBD()

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use("/auth",AuthRouter)
app.use('/api/productos',AuthProductos)

app.listen(PORT,() => {
    console.log(`El servidor esta escuchando en el puerto ${PORT}`);
} )

