const ProductosModel = require('../models/product');
const cloudinary = require('../utils/cloudinary');
const eliminarCarpeta = require('../utils/deleteFolder')
const crearCarpeta = require('../utils/createFolder')

const obtenerProductos = async (req, res) => {
    try {
        const productos = await ProductosModel.find();
        if (productos.length > 0) {
            return res.status(200).send(productos)
        } else {
            return res.status(200).send({msg:"No hay productos cargados" })
        }
    } catch (error) {
        return res.status(500).send({ msg: "Error en la base de datos al pedir los productos" })
    }
}

const crearProducto = async (req, res) => {

    const uploadDir = "./uploads";
    const files = req.files;

    crearCarpeta(uploadDir, files)

    const { codigo, nombre, marca, precio, categoria, descripcion, imagen,stock, destacado } = req.body;

    if (!nombre) return res.status(400).send({ msg: "Nombre requerido" });
    if (!codigo) return res.status(400).send({ msg: "Codigo requerido" });
    if (!precio) return res.status(400).send({ msg: "Precio requerido" });

    const newProduct = new ProductosModel({
        codigo,
        nombre,
        marca,
        precio,
        categoria,
        descripcion,
        imagen,
        stock,
        destacado
    })

    try {
        if (files.imagen && ( files.imagen.type === 'image/jpg' || files.imagen.type === 'image/jpeg') ) {
            const cloud_image = `./uploads/${files.imagen.name}`;
            const imagen = await cloudinary.uploader.upload(cloud_image);
            console.log(imagen);
            newProduct.imagen = imagen.secure_url
            newProduct.cloudinary_id = imagen.public_id
            await newProduct.save();
        } else {
            return res.status(400).send({ msg: "Debe ingresar una foto del producto / Solo se admite imagenes jpg o jpeg" })
        }

        eliminarCarpeta(uploadDir)
        return res.status(200).send({ msg: "Producto creado correctamente" })

    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(404).send({ msg: "No pueden existir 2 productos con el mismo codigo" })
        }
        return res.status(500).send({ msg: "Error a la hora de crear el producto" })
    }
}

const editarProducto = async (req, res) => {
    
    const { id } = req.params;

    let uploadDir;
    let files;

    const productoData = req.body;

    if(req.files.imagen) {
        uploadDir = "./uploads"
        files = req.files
        crearCarpeta(uploadDir, files)
    }

    const productoDb = await  ProductosModel.findById(id);

    try {

        if (req.files.imagen !== undefined && (req.files.imagen.type === 'image/jpg' || req.files.imagen.type === 'image/jpeg') ) {
            await cloudinary.uploader.destroy(productoDb.cloudinary_id)
            const rutaImag = `./uploads/${files.imagen.name}`;
            const archivoImagen = await cloudinary.uploader.upload(rutaImag)
            productoData.imagen = archivoImagen.secure_url
            productoData.cloudinary_id = archivoImagen.public_id
        } else {
            productoData.imagen = productoDb.imagen
        }

        await ProductosModel.findByIdAndUpdate(id, productoData);
        eliminarCarpeta(uploadDir)

        return res.status(200).send({ msg: "producto editado correctamente" })
    } catch (error) {
        console.log(error);
        return res.status(400).send({ msg: "Error en la base de datos al editar el producto" })
    }
}

const eliminarProducto = async (req, res) => {
    const { id } = req.params

    const productoAEliminar = await ProductosModel.findById(id)

    try {
        await ProductosModel.findByIdAndDelete(id);
        await cloudinary.uploader.destroy(productoAEliminar.cloudinary_id)
        return res.status(200).send({ msg: "Producto eliminado correctamente" })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error en la base de datos al eliminar producto" })
    }
}

module.exports = {
    obtenerProductos,
    crearProducto,
    editarProducto,
    eliminarProducto
}