class AppError extends Error {
    constructor(message, statusCode, name = "AppError") {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.name = name;
    }
}

module.exports = AppError;