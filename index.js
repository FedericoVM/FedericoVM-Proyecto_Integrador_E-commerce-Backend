const express = require("express");
require("dotenv").config();
const conectarBD = require("./dataBase");
const app = express()
const cors = require("cors")
const AuthRouter = require("./routes/auth")
const AuthProductos = require("./routes/productos");
const AuthFavoritos = require("./routes/favoritos")
const AuthCarrito  = require("./routes/carrito")
const AuthUsuario = require("./routes/usuario")
const AuthPago = require("./routes/pago")
const bodyParser = require("body-parser");

const PORT = 4000;

conectarBD();

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())
app.use("/carrito",AuthCarrito)
app.use("/auth",AuthRouter);
app.use('/productos',AuthProductos);
app.use('/usuario',AuthUsuario);
app.use('/favoritos', AuthFavoritos )
app.use("/mercadoPago",AuthPago);


app.listen(PORT,() => {
    console.log(`El servidor esta escuchando en el puerto ${PORT}`);
} )

app.use( (err, req, res, next) =>{
    console.log('Error Atrapado', err)

    const errorResponse =  {
        message: err.message || 'Error en el servidor',
    }

    const statusCode = err.statusCode || 500;

    if(err.data) {
        errorResponse.data = err.data;
    }

    res.status(statusCode).json(errorResponse)

})