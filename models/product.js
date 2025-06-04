const Mongoose = require("mongoose");

const ProductSchema = Mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
  },
  categoria: {
    type: String,
    required: true,
  },
  descripcion: String,
  imagen: {
    type: String,
    required: true,
  },
  stock: Number,
  marca: String,
  cloudinary_id: String,
  destacado: {
    type: Boolean,
    default: false,
  },
  descuento: Number
});

module.exports = Mongoose.model("Productos", ProductSchema);