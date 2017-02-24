app.get('/chat', lib.checkLogin, function(req, res) {
  res.render('chat');
});
