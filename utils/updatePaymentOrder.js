const PaymentOrderModel = require('../models/paymentOrder')

const updatePaymentOrder = async (payment, data) =>{

    let paymentActualizado = {
        data_id: payment['data.id'],
        costoTotal: data.transaction_amount,
        paymentStatus: data.status,
        emisorTarjeta: data.payment_method.id,
        tipoDeTarjeta: data.payment_method.type,
        ultimos4DigitosTarjeta: data.card.last_four_digits
      }
      await PaymentOrderModel.findOneAndUpdate({paymentOrder: data.external_reference}, paymentActualizado)
}

const buscarCoincidenciasCarrito = async (productosCarrito, email, productosCoincidentes, momentoActual) =>{

    const productosPaymentOrder = await PaymentOrderModel.findOne({usuarioEmail: email, paymentStatus: "Incompleto", carrito: true})

    if(!productosPaymentOrder || (momentoActual - Number(productosPaymentOrder.paymentOrder)) > 300000) return productosCoincidentes.push(undefined)

        productosCarrito.forEach((carritoProdu)=>{
            let productosCoinciden = productosPaymentOrder.productos.find((produ)=>{
                return carritoProdu.productos == produ.idProducto && carritoProdu.cantidad == produ.cantidad
            })
            
            productosCoincidentes.push(productosCoinciden)
        })

    return productosPaymentOrder.redirectUrl
}

const comprobarPaymentOrder = async (productosCarrito, email, carrito) =>{

    let productosCoincidentes = [];

    let urlRedirect

    let momentoActual = Date.now();

    if(carrito) {
       urlRedirect = await buscarCoincidenciasCarrito(productosCarrito, email, productosCoincidentes, momentoActual)
    } else {
        
       const productoPaymentOrder = await PaymentOrderModel.findOne({usuarioEmail: email, paymentStatus: "Incompleto", carrito: false, "productos.idProducto": `${productosCarrito._id}`})
       
       if(!productoPaymentOrder || ((momentoActual - Number(productoPaymentOrder.paymentOrder)) > 300000)) return false

       return urlRedirect = productoPaymentOrder.redirectUrl;
    }
 
    if(productosCoincidentes.includes(undefined)) return false
    return urlRedirect
}

module.exports = {
    updatePaymentOrder,
    comprobarPaymentOrder
}