const mongoose = require("mongoose")

const conectarBD = async () => {
    try {
        await mongoose.connect(process.env.URI_BD),{
            useNewUrlParser: true,
            useUnifiedTopology: true
        }

        console.log("Se logro conectar a la base de datos");

    } catch (error) {
        console.log(error);
        console.log("No se logro conectar a la base de datos");
        process.exit(1)
    }
}

module.exports = conectarBD