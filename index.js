const express = require("express");
require("dotenv").config();
const conectarBD = require("./dataBase");
const app = express()
const cors = require("cors")
const AuthRouter = require("./routes/auth")
const AuthProductos = require("./routes/productos");
const AuthCarrito  = require("./routes/carrito")
const AuthUsuario = require("./routes/usuario")




const bodyParser = require("body-parser");

const PORT = 4000;

conectarBD()

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())
app.use("/carrito",AuthCarrito)
app.use("/auth",AuthRouter);
app.use('/productos',AuthProductos);
app.use('/usuario',AuthUsuario);


app.listen(PORT,() => {
    console.log(`El servidor esta escuchando en el puerto ${PORT}`);
} )

