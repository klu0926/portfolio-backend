function responseJSON(ok, action, data, message, err) {
  if (ok !== true) {
    return {
      ok: false,
      action,
      data: null,
      message: message || 'action failed',
      err: typeof err === 'object' ? err.message : err
    }
  } else {
    return {
      ok: true,
      action,
      data,
      message: message || 'action successfully completed',
      err: null
    }
  }
}
module.exports = responseJSON