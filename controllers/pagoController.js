const CarritoModel = require("../models/carrito");
const ProductModel = require("../models/product");
const PaymentOrderModel = require("../models/paymentOrder");
const { Payment } = require("mercadopago");
const {
  crearPagoMP,
  crearPaymentOrder,
  clientMP,
} = require("../utils/crearPagoYPaymentOrder");
const {
  updatePaymentOrder,
  verificarEstadoCarrito,
  comprobarProductoDisponible,
  restarProductosDb,
  comprobarStatusDePago
} = require("../utils/ProductsDispoCheck");

const AppError = require("../utils/errors");

const comprobarCarritoActualizado = async (req, res, next) => {
  const { email, carritoFront } = req.body;

  try {
    const { costoTotalCarrito } = await verificarEstadoCarrito(
      email,
      carritoFront
    );

    return res.status(200).send({ costoTotal: costoTotalCarrito });
  } catch (error) {
    next(error);
  }
};

const finalizarPagoCarrito = async (req, res, next) => {
  const productosParaBodyPago = [];
  const { email } = req.user;
  const { userProducts, formData } = req.body;

  try {
    const {
      costoTotalCarrito,
      productosHistorial,
      productosMapeadosCarrito,
      totalCarritoDbProductos,
    } = await verificarEstadoCarrito(email, userProducts.carritoFront);

    userProducts.carritoFront.forEach((pro) => {
      let productoMatch = productosMapeadosCarrito.find((product) => {
        return pro.idProducto == product._id;
      });
      productosParaBodyPago.push({
        id: productoMatch._id,
        title: productoMatch.nombre,
        description: productoMatch.descripcion,
        picture_url: productoMatch.imagen,
        quantity: pro.cantidad,
        unit_price: productoMatch.precio,
      });
    });

    const resultadoDePago = await crearPagoMP(
      productosParaBodyPago,
      formData,
      costoTotalCarrito
    );

  if (resultadoDePago.status === "rejected" ) throw new AppError("Su compra fue rechazada, intente nuevamente mas tarde.", 404);

    await crearPaymentOrder(
      email,
      resultadoDePago,
      totalCarritoDbProductos,
      productosHistorial,
      costoTotalCarrito,
      true
    );

    await CarritoModel.deleteMany({
      email_usuario: email,
    });

    await comprobarStatusDePago(resultadoDePago, productosParaBodyPago, formData, costoTotalCarrito, res)
    
  } catch (error) {
    next(error);
  }
};

const verificarProductoDisponible = async (req, res, next) => {
  const { producto_id } = req.body;

  try {
    const { productoDb } = await comprobarProductoDisponible(producto_id);
    return res.status(200).send({ producto: productoDb });
  } catch (error) {
    next(error);
  }
};

const comprarProducto = async (req, res, next) => {

  const { email } = req.user;
  const { producto_id, formData } = req.body;

  try {
    const { productoDb, precioFinal } = await comprobarProductoDisponible(
      producto_id
    );

    const productoParaHistorial = [
      {
        idProducto: productoDb._id,
                cantidad: 1,
                precio: precioFinal
      }
    ]

    let productoParaBodyPago = [
      {
      id: productoDb._id,
      title: productoDb.nombre,
      description: productoDb.descripcion,
      picture_url: productoDb.imagen,
      quantity: 1,
      unit_price: precioFinal,
    }
  ];

    const resultadoDePago = await crearPagoMP(productoParaBodyPago, formData, precioFinal)

    if (resultadoDePago.status === "rejected") throw new AppError("Su compra fue rechazada, intente nuevamente mas tarde.", 404); 

    crearPaymentOrder(email, resultadoDePago, 1, productoParaHistorial, precioFinal, false)

    await comprobarStatusDePago(resultadoDePago, productoParaBodyPago, formData, precioFinal, res)
    
  } catch (error) {
    console.log(error);
    
    next(error);
  }
};

const confirmPayment = async (req, res) => {
  res.sendStatus(200);

  const client = clientMP();

  const payment = req.query;

  const paymentOrder = await PaymentOrderModel.findOne({
    idDePago: payment["data.id"],
  });

  if (!paymentOrder) return

  try {
    if (payment.type === "payment") {
      const pago = new Payment(client);
      const data = await pago.get({ id: payment["data.id"] });

      if (!paymentOrder) return;

      const { additional_info } = data;
      let productosComprados = additional_info.items;

      if (data.status === "approved") {
        if (paymentOrder.status === "in_process") {
          updatePaymentOrder(data);
        } else {
          restarProductosDb(productosComprados);
        }
      }

      if (data.status === "in_process") {
        updatePaymentOrder(data);
      } 
      
      if (data.status === "rejected") {
        for (const p of productosComprados) {
          const resultado = await ProductModel.findById(p.id);

          if (resultado) {
            let num = resultado.stock + p.quantity;
            let stockActualizado = { stock: num };
            await ProductModel.findByIdAndUpdate(
              resultado.id,
              stockActualizado
            );
          }
        }
        updatePaymentOrder(data);
      }
    }
    return;
  } catch (error) {
    return;
  }
}

const historialDePago = async (req, res) => {
  const { email } = req.params;

  let historialAEnviar = [];

  try {
    const historialDeCompras = await PaymentOrderModel.find({
      usuarioEmail: email
    });

    if (historialDeCompras.length <= 0)
      return res.status(200).send(historialAEnviar);

    historialAEnviar = await Promise.all(
      historialDeCompras.map(async (e) => {
        const promesasProductos = e.productos.map(async (element) => {
          const producto = await ProductModel.findById(
            element.idProducto
          ).lean();

          if (producto) {
            return {
              producto_id: element.idProducto,
              nombre: producto.nombre,
              precio: element.precio,
              destacado: producto.destacado,
              descuento: producto.descuento,
              imagen: producto.imagen,
              categoria: producto.categoria,
              cantidad: element.cantidad,
            };
          }
          return {
            producto_id: element.idProducto,
            nombre: "No Disponible",
            precio: element.precio,
            destacado: "No Disponible",
            descuento: "No Disponible",
            imagen: "No Disponible",
            categoria: "No Disponible",
            cantidad: element.cantidad,
          };
        });

        const productosFinales = await Promise.all(promesasProductos);
        return {
          paymentOrder: e.paymentOrder,
          paymentStatus: e.paymentStatus,
          productos: productosFinales,
          totalDeProductos: e.totalDeProductos,
          costo: e.costoTotal,
          emisorTarjeta: e.emisorTarjeta,
          tipoDeTarjeta: e.tipoDeTarjeta,
          ultimos4Digitos: e.ultimos4DigitosTarjeta,
        };
      })
    );

    return res.status(200).send(historialAEnviar);
  } catch (error) {
    return res.status(500).send({ mensaje: "Error en el servidor" });
  }
};

module.exports = {
  comprobarCarritoActualizado,
  verificarProductoDisponible,
  finalizarPagoCarrito,
  confirmPayment,
  historialDePago,
  comprarProducto,
};
