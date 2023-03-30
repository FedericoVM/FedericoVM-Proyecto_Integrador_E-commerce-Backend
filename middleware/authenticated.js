const jwt_util = require("../utils/jwt");

const autorizado = (req,res,next) => {
  
    if (!req.headers.authorization) {
        return res.status(400).send({mensaje:"Error! Falta el headers de autorizacion"})
    } else {
        const token = req.headers.authorization.replace("Bearer ","")
        try {
            const payload = jwt_util.decode(token);
            req.user = payload;
          
            next()
        } catch (error) {
            return res.status(500).send(error)
        }
    }
}


const esAdmin = (req,res,next) => {
   
    if (req.user.role && req.user.role == "admin") {
        next();
    } else {
        return res.status(500).send({mensaje:"Esta accion solo puede realizar el administrador"})
    }
}


module.exports = {
    autorizado,
    esAdmin
} 
