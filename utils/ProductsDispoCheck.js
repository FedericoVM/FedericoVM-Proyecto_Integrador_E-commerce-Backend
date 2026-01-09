const PaymentOrderModel = require("../models/paymentOrder");
const CarritoModel = require("../models/carrito");
const AppError = require("./errors");
const ProductModel = require("../models/product");

const updatePaymentOrder = async (data) => {
  let paymentActualizado = {
    paymentStatus: data.status,
  };
  await PaymentOrderModel.findOneAndUpdate(
    { idDePago: data.id },
    paymentActualizado
  );
};

const precioConDescuento = (descuento, precioDelProducto, cantidad = 1) => {
  if (descuento >= 10) {
    return (
      (precioDelProducto - precioDelProducto * Number(`0.${descuento}`)) *
      cantidad
    );
  } else {
    return (
      (precioDelProducto - precioDelProducto * Number(`0.0${descuento}`)) *
      cantidad
    );
  }
};

const compararArrayCarritoProductos = (carritoDb, carritoAComparar) => {
  let arrayCoincidentes = [];

  carritoDb.forEach((carritoProdu) => {
    let productosCoinciden = carritoAComparar.find((produ) => {
      return (
        carritoProdu.idProducto == produ.idProducto &&
        carritoProdu.cantidad == produ.cantidad
      );
    });
    arrayCoincidentes.push(productosCoinciden);
  });

  if (arrayCoincidentes.includes(undefined)) return false;
  return true;
};

const comprobarStock = (arrayCarritoFront, productosDB, stockDeProductos) => {
  arrayCarritoFront.forEach((producto) => {
    let productoABuscar = productosDB.find((pro) => {
      return producto.idProducto == pro._id;
    });
    if (productoABuscar.stock <= 0)
      stockDeProductos.productosSinStock.push(productoABuscar);
    if (producto.cantidad > productoABuscar.stock)
      stockDeProductos.productosInsuficientes.push(productoABuscar);
  });
};

const productosTotal = (carritoAContar) => {
  let total = 0;

  carritoAContar.forEach((pro) => {
    total += pro.cantidad;
  });

  return total;
};

const costoTotal = (carritoAcomprar, productosDB) => {
  let costoTotal = 0;

  carritoAcomprar.forEach((producto) => {
    let findProducto = productosDB.find((pro) => {
      return producto.idProducto == pro._id;
    });

    if (findProducto.destacado) {
      costoTotal += precioConDescuento(
        findProducto.descuento,
        findProducto.precio,
        producto.cantidad
      );
    } else {
      costoTotal += findProducto.precio * producto.cantidad;
    }
  });

  return costoTotal;
};

const carritoArrayHistorial = (
  arrayCarrito,
  arrayProductos,
  arrayParaHistorial
) => {
  arrayCarrito.forEach((producto) => {
    let precioProducto = 0;
    const productoEncontrado = arrayProductos.find((pro) => {
      return producto.idProducto == pro._id;
    });
    if (productoEncontrado.destacado) {
      precioProducto = precioConDescuento(
        productoEncontrado.descuento,
        productoEncontrado.precio,
        producto.cantidad
      );
    } else {
      precioProducto = productoEncontrado.precio;
    }
    arrayParaHistorial.push({
      idProducto: producto.idProducto,
      cantidad: producto.cantidad,
      precio: precioProducto,
    });
  });
};

const verificarEstadoCarrito = async (email, carritoFront) => {
  const historialProductos = [];

  const productosCarritoDB = await CarritoModel.find({ email_usuario: email });

  if (productosCarritoDB.length <= 0)
    throw new AppError("Su carrito esta vacio", 400);
  if (carritoFront.length === undefined && productosCarritoDB.length > 0)
    throw new AppError("Su carrito esta desactualizado", 400);

  const productosDBMapeados = await Promise.all(
    productosCarritoDB.map((pro) => ProductModel.findById(pro.idProducto))
  );

  if (productosDBMapeados.includes(undefined))
    throw new AppError("Uno de los productos no esta disponible", 404);

  const totalFrontProductos = productosTotal(carritoFront);
  const totalCarritoDbProductos = productosTotal(productosCarritoDB);
  const coincideCarroFrontYBack = compararArrayCarritoProductos(
    productosCarritoDB,
    carritoFront
  );

  if (
    !coincideCarroFrontYBack ||
    totalFrontProductos !== totalCarritoDbProductos ||
    carritoFront.length !== productosCarritoDB.length
  ) {
    throw new AppError("Su carrito no esta actualizado.", 404);
  }

  const stock = {
    productosSinStock: [],
    productosInsuficientes: [],
  };

  comprobarStock(productosCarritoDB, productosDBMapeados, stock);

  if (stock.productosSinStock.length > 0)
    throw new AppError(
      "Estos productos no tienen stock",
      404,
      stock.productosSinStock
    );
  if (stock.productosInsuficientes.length > 0)
    throw new AppError(
      "Estos productos no tienen suficiente stock",
      404,
      stock.productosInsuficientes
    );

  carritoArrayHistorial(carritoFront, productosDBMapeados, historialProductos);

  const costoTotalCarrito =
    Math.round(costoTotal(productosCarritoDB, productosDBMapeados) * 100) / 100;

  return {
    costoTotalCarrito: costoTotalCarrito,
    totalCarritoDbProductos: totalCarritoDbProductos,
    productosHistorial: historialProductos,
    productosMapeadosCarrito: productosDBMapeados,
  };
};

const comprobarProductoDisponible = async (idProducto) => {
  let precioFinal = 0;

  const productoDB = await ProductModel.findById(idProducto);

  if (!productoDB)
    throw new AppError("Este producto no se encuentra disponible.", 404);
  if (productoDB.stock <= 0)
    throw new AppError("Este producto no tiene stock", 404);

  if (productoDB.destacado) {
    precioFinal += precioConDescuento(productoDB.descuento, productoDB.precio);
  } else {
    precioFinal += productoDB.precio;
  }

  return {
    precioFinal: precioFinal,
    productoDb: productoDB,
  };
};

const restarProductosDb = async (productos) => {
  for (const p of productos) {
    const resultado = await ProductModel.findById(p.id);

    if (resultado) {
      let num = resultado.stock - p.quantity;
      if (num >= 0) {
        let stockActualizado = { stock: num };
        await ProductModel.findByIdAndUpdate(resultado.id, stockActualizado);
      }
    }
  }
};

const comprobarStatusDePago = async (
  pagoData,
  productosParaBodyPago,
  formData,
  costoTotalCarrito,
  res
) => {
  if (pagoData.status === "approved")
    res.status(200).send({
      mensaje: "Compra Realizada con exito, que disfrute su compra.",
    });

  if (pagoData.status === "in_process") {
    await restarProductosDb(productosParaBodyPago, formData, costoTotalCarrito);
    res.status(203).send({
      mensaje: "Su compra esta en espera de confirmacion de su banco",
    });
  }
};

module.exports = {
  updatePaymentOrder,
  comprobarStock,
  compararArrayCarritoProductos,
  productosTotal,
  costoTotal,
  carritoArrayHistorial,
  verificarEstadoCarrito,
  comprobarProductoDisponible,
  restarProductosDb,
  comprobarStatusDePago,
};
