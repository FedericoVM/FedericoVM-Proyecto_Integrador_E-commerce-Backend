const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.URI_CONECTION_DATABASE);
        console.log('Base de datos conectada')
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = conectarDB