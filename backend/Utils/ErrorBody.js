class ErrorBody {
  constructor(statusCode, message, errors) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}

module.exports = ErrorBody;