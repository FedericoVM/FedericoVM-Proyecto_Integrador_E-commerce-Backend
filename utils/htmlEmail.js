const htmlEmail = (nombre, id, token) =>{
    return (
    `<style>
    body{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    a{
      background-color: #913175;
      height: 2rem;
      border-radius: 5px;
      text-decoration: none;
      color: white;
      align-content: center;
    }
  </style>
  <body>
    <h1>Rolling Store</h1>
    <p>Hola ${nombre}.</p>
    <p>Haz click en el siguiente boton para redirigirte y activar tu cuenta</p>
    <a href="${process.env.URI_API}/usuario/${id}/verify/${token}" target="_blank">Activar Cuenta</a>
  </body>`
)
}

const htmlEmailRecuperarContrasenia = (token, nombre) =>{
  return (
    `<style>
    body{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    a{
      background-color: #913175;
      height: 2rem;
      border-radius: 5px;
      text-decoration: none;
      color: white;
      align-content: center;
    }
  </style>
  <body>
    <h1>Rolling Store</h1>
    <p>Hola ${nombre}.</p>
    <p>Haz click en el siguiente boton para redirigirte y recuperar tu contrasenia</p>
    <a href="${process.env.URI_API}/recuperacion-contrasenia/${token}" target="_blank">Recuperar contrasenia</a>
  </body>`
)
}

module.exports = {
  htmlEmail,
  htmlEmailRecuperarContrasenia
}