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
      background-color: rgb(81, 41, 210);
      height: 1.5rem;
      border-radius: 5px;
      text-decoration: none;
      color: white;
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

module.exports = htmlEmail