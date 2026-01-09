class AppError extends Error {
    constructor(mensaje, statusCode, data){
        super(mensaje);
        this.statusCode = statusCode
        this.data = data || null
    }
}

module.exports = AppError