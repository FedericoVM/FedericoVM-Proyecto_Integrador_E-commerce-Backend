const ProductosModel = require('../models/product');
const cloudinary = require('../utils/cloudinary')

const obtenerProductos = async(req, res) => {
    try {
        const productos = await ProductosModel.find();
        if(productos){
            return res.status(200).send(productos)
        } else {
            return res.status(200).send([])
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({msg:"Error en la base de datos al pedir los productos"})
    }
}

const crearProducto = async(req, res) => {
    
    const {codigo, nombre, marca, precio, categoria, descripcion, imagen, stock} = req.body;
    
    if (!nombre) return res.status(400).send({msg:"Nombre requerido"});
    if (!codigo) return res.status(400).send({msg:"Codigo requerido"});
    if (!precio) return res.status(400).send({msg:"Precio requerido"});

    const newProduct = new ProductosModel({
        codigo,
        nombre,
        marca,
        precio,
        categoria,
        descripcion,
        imagen,
        stock
    })

    try {
        if (req.files.file){
            const cloud_image = await cloudinary.uploader.upload(req.files.file.path)
            return console.log(cloud_image)
        }
        return console.log(newProduct)
        const productoDB = await newProduct.save();
        console.log(producto);
        return res.status(200).send({msg:"Producto creado correctamente"})
    } catch (error) {
     console.log(error);
     return res.status(500).send({msg:"Error en la base de datos al crear el producto"})   
    }
}

const editarProducto = async(req, res) => {
    const {id} = req.params;

    const productoData = req.body;

    try {
        await ProductosModel.findOneAndUpdate(id, productoData);
        return res.status(200).send({msg: "producto editado correctamente"})
    } catch (error) {
        console.log(error);
        return res.status(400).send({msg:"Error en la base de datos al editar el producto"})        
    }
}

const eliminarProducto= async (req, res) => {
    const {id} = req.params

    try {
        await ProductosModel.findByIdAndDelete(id);
        return res.status(200).send({msg:"Producto eliminado correctamente"})
    } catch (error) {
        console.log(error);
        return res.status(500).send({msg:"Error en la base de datos al eliminar producto"})
    }
}

module.exports = {
    obtenerProductos,
    crearProducto,
    editarProducto,
    eliminarProducto
}