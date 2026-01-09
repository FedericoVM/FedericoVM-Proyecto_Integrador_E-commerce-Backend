const {MercadoPagoConfig, Payment} = require('mercadopago');
const {v4: uuidv4} = require('uuid')
const PaymentOrderModel = require("../models/paymentOrder")

const clientMP = () => {
    const clientReturn = new MercadoPagoConfig({accessToken: `${process.env.PRIVATE_KEY_MP}`})
    return clientReturn
}

const crearPagoMP = async (listaItems, formData, costoTotal) =>{

  const pago = new Payment(clientMP())

  const idemPotency = uuidv4()
  
  const dataPago = await pago.create({
    body: {
        additional_info:{
          items: listaItems,
        },
        description: "Compra",
        installments: formData.installments,
        payer: formData.payer,
        payment_method_id: formData.payment_method_id,
        token: formData.token,
        transaction_amount: costoTotal,
        notification_url:
      `https://0fe94d47d4db.ngrok-free.app/mercadoPago/payment-confirm`,
      },
      requestOptions:{
        idempotencyKey: idemPotency
      }
  })
  return dataPago
}

const crearPaymentOrder = async (email, resultadoDePago, totalDeProductos, productosAHistorial, costoTotal, boolean) => {

  const paymentOrder = new PaymentOrderModel({
    usuarioEmail: email,
      idDePago: resultadoDePago.id,
      carrito: boolean,
      paymentOrder: Date.now(),
      totalDeProductos: totalDeProductos,
      paymentStatus: resultadoDePago.status,
      productos: productosAHistorial,
      costoTotal: costoTotal,
      emisorTarjeta: resultadoDePago.payment_method_id,
      tipoDeTarjeta: resultadoDePago.payment_type_id,
      ultimos4DigitosTarjeta: resultadoDePago.card.last_four_digits
  })
  await paymentOrder.save()
}

module.exports = {
    clientMP,
    crearPagoMP,
    crearPaymentOrder
}