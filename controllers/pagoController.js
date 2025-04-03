const CarritoModel = require("../models/carrito");
const ProductModel = require("../models/product");
const PaymentOrderModel = require("../models/paymentOrder");
const { Preference, Payment } = require("mercadopago");
const MercadoPagoConfig = require("../utils/bodyPreference");
const {
  updatePaymentOrder,
  comprobarPaymentOrder,
} = require("../utils/updatePaymentOrder");

const paymentCarrito = async (req, res) => {
  const client = MercadoPagoConfig.clientMP();

  const paymentNumberOrder = Date.now();
  let productosCarrito;
  let productosMapeados;
  let productosParaPreferencesMP = [];
  let sinStock = [];

  const { nombre, apellido } = req.user;

  const { email } = req.body;

  productosCarrito = await CarritoModel.find({ email_usuario: email });

  if (productosCarrito.length === 0) {
    return res.status(400).send({ mensaje: "Su carrito esta vacio." });
  }

  const productosPromesas = productosCarrito.map(async (prod) => {
    const respuesta = await ProductModel.findById(prod.productos);
    return respuesta;
  });

  await Promise.all(productosPromesas)
    .then((values) => {
      productosMapeados = values;
    })
    .catch(() => {
      return res
        .status(501)
        .send({ mensaje: "Hubo un error al procesar los productos." });
    });

  let productoNoEncontrado = productosMapeados.some((produc) => {
    return produc === undefined;
  });

  if (productoNoEncontrado) {
    return res.status(404).send({ mensaje: "Un producto no esta disponible." });
  }

  let productosFiltrados = productosMapeados.filter((produc) => {
    return produc !== null;
  });

  productosCarrito.forEach((produc) => {
    let itemsPreference = productosFiltrados.find((pro) => {
      return produc.productos === pro._id.toString();
    });
    if (itemsPreference) {
      if (
        itemsPreference.stock > 0 &&
        itemsPreference.stock >= produc.cantidad
      ) {
        let nuevoProduct = MercadoPagoConfig.crearItemsParaElBody(
          itemsPreference,
          produc.cantidad
        );

        return productosParaPreferencesMP.push(nuevoProduct);
      } else {
        sinStock.push(itemsPreference._id);
      }
    }
  });

  let body = MercadoPagoConfig.bodyPreferences(
    nombre,
    apellido,
    paymentNumberOrder
  );

  if (sinStock.length > 0) {
    return res.status(401).send({
      mensaje: `Error en el pago. Los siguientes productos estan sin stock:`,
      sinStock,
    });
  } else {
    body.items = productosParaPreferencesMP;
    const productosHistorial = productosCarrito.map((e) => {
      return (respuesta = {
        idProducto: `${e.productos}`,
        cantidad: e.cantidad,
      });
    });

    let arrayDeConcidencias = await comprobarPaymentOrder(
      productosCarrito,
      email,
      true
    );

    if (arrayDeConcidencias !== false) {
      return res.status(200).send({ redirecttUrl: arrayDeConcidencias });
    } else {
      await PaymentOrderModel.findOneAndDelete({
        usuarioEmail: email,
        paymentStatus: "Incompleto",
        carrito: true,
      });
    }

    try {
      const preference = new Preference(client);
      const data = await preference.create({ body });
      const paymentOrder = new PaymentOrderModel({
        usuarioEmail: email,
        paymentOrder: paymentNumberOrder,
        redirectUrl: data.init_point,
        productos: productosHistorial,
        carrito: true,
      });

      await paymentOrder.save();

      return res
        .status(data.api_response.status)
        .send({ redirecttUrl: data.init_point });
    } catch (error) {
      return res.status(501).send({ mensaje: "Error en el servidor" });
    }
  }
};

const payment = async (req, res) => {
  const client = MercadoPagoConfig.clientMP();

  let body;

  const paymentNumberOrder = Date.now();

  const { email, nombre, apellido } = req.user;

  const { producto_id } = req.body;

  const productoEncontrado = await ProductModel.findById(producto_id);

  if (productoEncontrado && productoEncontrado.stock > 0) {
    const productoOrderPayment = await comprobarPaymentOrder(
      productoEncontrado,
      email,
      false
    );

    if (productoOrderPayment !== false) {
      return res.status(200).send({ redirecttUrl: productoOrderPayment });
    } else {
      await PaymentOrderModel.findOneAndDelete({
        usuarioEmail: email,
        paymentStatus: "Incompleto",
        carrito: false,
        "productos.idProducto": `${productoEncontrado._id}`,
      });
    };

    body = MercadoPagoConfig.bodyPreferences(
      nombre,
      apellido,
      paymentNumberOrder
    );
    let items = MercadoPagoConfig.crearItemsParaElBody(productoEncontrado, 1);

    body.items.push(items);
  } else {
    return res.status(401).send({
      mensaje: `No se encontro el producto o No hay stock del producto.`,
    });
  }

  try {
    const preference = new Preference(client);
    const result = await preference.create({ body });

    const paymentOrder = new PaymentOrderModel({
      usuarioEmail: email,
      paymentOrder: paymentNumberOrder,
      redirectUrl: result.init_point,
      carrito: false,
      productos: [
        {
          idProducto: producto_id,
          cantidad: 1,
          precioUnitario: body.items[0].unit_price,
        },
      ],
    });

    await paymentOrder.save();

    return res
      .status(result.api_response.status)
      .send({ redirecttUrl: result.init_point });
  } catch (error) {
    return res.status(501).send({ mensaje: error.message });
  }
};

const confirmPayment = async (req, res) => {
  const client = MercadoPagoConfig.clientMP();

  const payment = req.query;

  const paymentProcessed = await PaymentOrderModel.findOne({
    data_id: payment["data.id"],
  });

  if (paymentProcessed && paymentProcessed.data_id === payment["data.id"]) {
    return res.sendStatus(200);
  }

  try {
    if (payment.type === "payment") {
      const pago = new Payment(client);
      const data = await pago.get({ id: payment["data.id"] });

      const paymentOrder = await PaymentOrderModel.findOne({
        paymentOrder: data.external_reference,
      });

      const { additional_info } = data;

      if (data.status === "approved") {
        let productosComprados = additional_info.items;

        for (const p of productosComprados) {
          const resultado = await ProductModel.findById(p.id);

          if (resultado) {
            let num = resultado.stock - p.quantity;
            if (num >= 0) {
              let stockActualizado = { stock: num };
              await ProductModel.findByIdAndUpdate(
                resultado.id,
                stockActualizado
              );
            }
          }
        }
        updatePaymentOrder(payment, data);
        if (paymentOrder.carrito) {
          await CarritoModel.deleteMany({
            email_usuario: paymentOrder.usuarioEmail,
          });
        }
      } else if (data.status === "in_process") {
        updatePaymentOrder(payment, data);
      } else if (data.status === "rejected") {
        updatePaymentOrder(payment, data);
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(400);
  }
};

module.exports = {
  paymentCarrito,
  payment,
  confirmPayment,
};
