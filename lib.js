module.exports.checkLogin = function(req, res, next) {
  if (!req.session.user) {
    res.send('Not logged in.');
  }

  next();
}
