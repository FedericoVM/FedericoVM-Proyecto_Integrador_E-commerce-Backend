const express = require("express")
const FavoritoController = require("../controllers/favoritoController");
const autMiddleware = require("../middleware/authenticated");
const router = express.Router()


router.get("/",autMiddleware.autorizado,FavoritoController.mostrarFavoritos);
router.post("/",autMiddleware.autorizado, FavoritoController.agregarFavorito);
router.delete("/:id",autMiddleware.autorizado, FavoritoController.eliminarFavorito);

module.exports = router