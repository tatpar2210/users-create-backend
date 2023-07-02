exports.throwError = (statusCode, status, message) => {
  throw new Error(JSON.stringify({
    statusCode: statusCode,
    status: status,
    msg: message
  }))
}