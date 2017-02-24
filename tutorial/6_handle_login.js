app.post('/login', function(req, res) {
  if (!req.body.email || req.body.email == "") {
    return res.send(400);
  }

  if (!req.body.password || req.body.password == "") {
    return res.send(400);
  }

  User.findOne({'email': req.body.email}, function(err, user) {
    if (err) {
      console.log(err);
      return res.send(500);
    }

    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.cookie('user', user.first_name + ' ' + user.last_name);
        req.session.user = user;
        res.redirect('/chat');
      } else {
        req.session.user = null;
        return res.send(401);
      }
    } else {
      return res.send(401);
    }
  });
});
