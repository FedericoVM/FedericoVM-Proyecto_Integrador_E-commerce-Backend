const CarritoModel = require("../models/carrito");
const ProductModel = require("../models/product");
const MercadoPago = require("mercadopago");

const paymentCarrito = async (req, res) => {
  let productosCarrito;
  let productos;
  let sinStock = [];

  const { email } = req.body;

  productosCarrito = await CarritoModel.find({ email_usuario: email });

  const productosPromesas = productosCarrito.map(async (prod) => {
    const respuesta = await ProductModel.findById(prod.productos);

    if (respuesta && respuesta.stock > 0 && respuesta.stock >= prod.cantidad) {
      let nuevoProduct = {
        id: respuesta.id,
        nombre: respuesta.nombre,
        categoria: respuesta.categoria,
        precio: respuesta.precio,
        cantidad: prod.cantidad,
      };

      return nuevoProduct;
    } else {
      sinStock.push(respuesta.id);
    }
  });

  await Promise.all(productosPromesas).then((values) => {
    productos = values;
  });

  const preferences = {
    items: [],
    back_urls: {
      success: `${process.env.URI_API}`,
      pending: `${process.env.URI_API}`,
      failure: `${process.env.URI_API}`,
    },
    auto_return: "approved",
  };

  if (sinStock.length > 0) {
    return res.status(200).send({
      mensaje: `Error en el pago. Los siguientes productos estan sin stock:`, sinStock
    });
  } else {
    productos.map((p) => {
      if (p != undefined) {
        preferences.items.push({
          id: p.id,
          title: p.nombre,
          category_id: p.categoria,
          quantity: p.cantidad,
          currency_id: "ARS",
          unit_price: p.precio,
        });
      }
    });

    try {
      const payment = await MercadoPago.preferences.create(preferences);
      return res
        .status(payment.status)
        .send({ redirecttUrl: payment.body.init_point });
    } catch (error) {
      return res.status(501).send({ auto_return: error.message });
    }
  }
};

const payment = async (req, res) => {
  let sinStock = [];
  let productoPreference;

  const { producto_id } = req.body;

  const productoEncontrado = await ProductModel.findById(producto_id);

  if (productoEncontrado && productoEncontrado.stock > 0) {
    const preferences = {
      items: [
        {
          id: productoEncontrado._id,
          title: productoEncontrado.nombre,
          category_id: productoEncontrado.categoria,
          quantity: 1,
          currency_id: "ARS",
          unit_price: productoEncontrado.precio,
        },
      ],
      back_urls: {
        success: `${process.env.URI_API}`,
        pending: `${process.env.URI_API}`,
        failure: `${process.env.URI_API}/failure`,
      },
      auto_return: "approved",
    };

    productoPreference = preferences;
  } else {
    sinStock.push(productoEncontrado.id);
  }

  if (sinStock.length > 0) {
    return res
      .status(200)
      .send({
        mensaje: `Error en el pago. No hay stock del producto:`, sinStock
      });
  } else {
    try {
      const payment = await MercadoPago.preferences.create(productoPreference);
      return res
        .status(payment.status)
        .send({ redirecttUrl: payment.body.init_point });
    } catch (error) {
      return res.status(501).send({ failure: error.message });
    }
  }
};

const confirmPayment = async (req, res) => {

  const productoComprado= [];

  const { collection_id } = req.body;

  try {
    const response = await MercadoPago.payment.get(collection_id);

    const { status,additional_info } = response.response;

    let productosComprados = additional_info.items;

    for (const p of productosComprados) {
      const resultado = await ProductModel.findById(p.id);
      if (resultado) {
        let num = resultado.stock - p.quantity;
        if (num >= 0) {
          let stockActualizado = { stock: num };
          await ProductModel.findByIdAndUpdate(resultado.id, stockActualizado);
          productoComprado.push(resultado.id);
          return res.status(200).send({
            mensaje:`${productoComprado}, ${status}` ,
          });
        } else {
          return res
            .status(400)
            .send({ mensaje: "Error! No hay stock" });
        }
      }
    }
    
  } catch (error) {
    return res.status(error.status).send(error.message);
  }
};

module.exports = {
  paymentCarrito,
  payment,
  confirmPayment,
};
