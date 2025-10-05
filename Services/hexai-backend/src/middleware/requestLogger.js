export function requestLogger(req, _res, next) {
  req.reqStart = Date.now();
  next();
}