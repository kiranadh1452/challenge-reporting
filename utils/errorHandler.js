module.exports = {
  sendErrorResponse,
  formatAndThrowError
}

async function sendErrorResponse (err, req, res, next) {
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || 'Internal Server Error' })
    .end()
}

function formatAndThrowError (statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode

  throw error
}
