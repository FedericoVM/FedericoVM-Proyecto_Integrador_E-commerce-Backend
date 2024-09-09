const htmlEmailTokenActivarCuenta = (nombre, id, token) =>{
    return (
    `<style>
     .body-email-token {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .logo-pagina {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 4rem;
      background-color: #752b5f;
      color: whitesmoke;
    }

    .boton-redirigir {
       border-radius: 4px;
      border: 2px solid;
      border-color: #913175;
      background-color: #913175;
      font-size: 1.08rem;
      text-align: center;
      text-decoration: none;
      width: 7rem;
      height: 1.1rem;
      color: whitesmoke;
    }

    .saludo {
      font-size: 1.5rem;
    }

    .boton-redirigir:hover {
      background-color: #752b5f;
    }
  </style>
  <body class="body-email-token">
    <h1 class="logo-pagina">Rolling Store</h1>
    <p class="saludo">Hola ${nombre}.</p>
    <p>Haz click en el siguiente boton para redirigirte y activar tu cuenta</p>
    <a class="boton-redirigir" href="${process.env.URI_API}/usuario/${id}/verify/${token}" target="_blank">Activar Cuenta</a>
  </body>`
)
}

const htmlEmailTokenRecuperarContrasenia = (nombre, token) => {
  return (
    `<style>
    .body-email-token {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .logo-pagina {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 4rem;
      background-color: #752b5f;
      color: whitesmoke;
    }

    .boton-redirigir {
      border-radius: 4px;
      border: 2px solid;
      border-color: #913175;
      background-color: #913175;
      font-size: 1.08rem;
      text-align: center;
      text-decoration: none;
      width: 7rem;
      height: 1.1rem;
      color: whitesmoke;
    }

    .saludo {
      font-size: 1.5rem;
    }

    .boton-redirigir:hover {
      background-color: #752b5f;
    }
  </style>
  </style>
  <body class="body-email-token">
    <h1 class="logo-pagina">Rolling Store</h1>
    <p class="saludo">Hola ${nombre}.</p>
    <p>Haz click en el siguiente boton para redirigirte y cambiar tu contrasenia</p>
    <a class="boton-redirigir" href="${process.env.URI_API}/recuperacion-contrasenia/${token}">Recuperar Contraseña</a>
    </body>`
  )
}

module.exports = {
  htmlEmailTokenActivarCuenta,
  htmlEmailTokenRecuperarContrasenia
}