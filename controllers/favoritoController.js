const FavoritoModel = require("../models/favorito.js");
const ProductosModel = require("../models/product.js");

const mostrarFavoritos = async (req, res) => {
  const { email } = req.body;

  try {
    const listaFavoritos = await FavoritoModel.find({ email_usuario: email });

    if (listaFavoritos.length > 0) {
      return res.status(200).send(listaFavoritos);
    } else {
      return res.status(200).send({ mensaje: "No hay productos favoritos" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ mensaje: "Ocurrio un error a la hora de acceder a favoritos" });
  }
};

const agregarFavorito = async (req, res) => {
  const { email_usuario, productos } = req.body;

  try {

    const nuevoFavorito = new FavoritoModel({
      email_usuario,
      productos,
    });

    const usuarioEncontrado = await FavoritoModel.find({
      email_usuario: email_usuario
    });



    let productoEncontrado = usuarioEncontrado.some((usuario) => {
      return usuario.productos === productos;
    });


    if (productoEncontrado) {
      return res
        .status(200)
        .send({ mensaje: "Error! El producto ya esta agregado en favoritos" });
    } 

    await nuevoFavorito.save();

    return res.status(200).send({ mensaje: "Se agrego a favoritos" });
  } catch (error) {
    return res
      .status(500)
      .send({
        mensaje: "Ocurrio un error a la hora de mostrar la lista de favoritos",
      });
  }
};

const eliminarFavorito = async (req, res) => {
  const { id } = req.params;

  try {
    await FavoritoModel.findByIdAndDelete(id);

    return res.status(200).send({ mensaje: "Se elimino de favoritos" });

  } catch (error) {
    return res
      .status(500)
      .send({ mensaje: "Ocurrio un error a la hora de realizar la operacion" });
  }
};

module.exports = {
  mostrarFavoritos,
  agregarFavorito,
  eliminarFavorito
};
