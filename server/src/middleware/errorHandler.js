export function notFoundHandler(request, response) {
  response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.originalUrl} was not found.` } })
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error)
  console.error(`[API Error] ${request.method} ${request.originalUrl}:`, error)
  if (error?.code === 11000) {
    return response.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'An employee with that identifier or email already exists.' } })
  }
  if (error?.name === 'ValidationError') {
    const fields = Object.fromEntries(Object.entries(error.errors).map(([field, value]) => [field, value.message]))
    return response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', fields } })
  }
  if (error?.name === 'CastError') {
    return response.status(400).json({ success: false, error: { code: 'INVALID_ID', message: `Invalid identifier format: ${error.value}` } })
  }
  const status = error.statusCode ?? (error.name === 'MongooseError' ? 503 : 500)
  response.status(status).json({
    success: false,
    error: {
      code: error.code ?? (status === 503 ? 'DATA_SOURCE_UNAVAILABLE' : 'INTERNAL_ERROR'),
      message: status === 500 ? (error.message || 'An unexpected server error occurred.') : error.message,
      ...(error.fields && Object.keys(error.fields).length > 0 ? { fields: error.fields } : {}),
    },
  })
}
