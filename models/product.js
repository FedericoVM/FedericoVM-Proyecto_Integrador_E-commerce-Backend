const Mongoose = require("mongoose");

const ProductSchema = Mongoose.Schema({
  nombre:{
    type:String,
    required:true
  },
  precio:Number,
  codigo:{
    type:String,
    required:true,
    unique:true
  },
  categoria:String,
  descripcion:String,
  imagen:{
    type:String,
    required:true
  },
  stock:Number,
  marca:String,
  destacado: {
    type:Boolean,
    default:false
  }
}) 

module.exports = Mongoose.model("Products", ProductSchema)