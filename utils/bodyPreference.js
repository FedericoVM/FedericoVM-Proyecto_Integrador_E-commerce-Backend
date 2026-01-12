const {MercadoPagoConfig} = require('mercadopago');
const momentoActual = require('moment')

const clientMP = () => {
    const clientReturn = new MercadoPagoConfig({accessToken: `${process.env.PRIVATE_KEY_MP}`})
    return clientReturn
}

const bodyPreferences = (nombre, apellido, paymentNumberOrder) => {

  const expirationISO = momentoActual().add(5, 'minutes').toISOString()

  let bodyReturn = {
    items: [],
    back_urls: {
      success: `${process.env.URI_API}`,
      pending: `${process.env.URI_API}`,
      failure: `${process.env.URI_API}`,
    },
    auto_return: "approved",
    notification_url:
      'https://cfa4-2800-810-429-829c-c552-f196-ec10-29f9.ngrok-free.app/mercadoPago/payment-confirm',
    payer: {
      name: nombre,
      surname: apellido,
    },
    external_reference: `${paymentNumberOrder}`,
    expiration_date_to: `${expirationISO}`,
  };
  return bodyReturn
};

const crearItemsParaElBody = (producto, cantidad) =>{
  let itemParaBody = {
    id: producto._id,
    title: producto.nombre,
    picture_url: producto.imagen,
    category_id: producto.categoria,
    currency_id: "ARS",
    quantity: cantidad,
    unit_price: producto.precio,
  };
  if (producto.destacado === true){
    if (producto.descuento >= 10) {
      itemParaBody.unit_price =
      producto.precio - producto.precio * Number(`0.${producto.descuento}`);
    } else {
      itemParaBody.unit_price =
      producto.precio - producto.precio * Number(`0.0${producto.descuento}`);
    }
  }

  return itemParaBody
}

module.exports = {
    clientMP,
    bodyPreferences,
    crearItemsParaElBody
}