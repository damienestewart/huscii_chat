var User = require(path.join(__dirname, 'user.model.js'));

app.post('/register', function(req, res) {
  if (!req.body.first_name || req.body.first_name == "") {
    return res.send(400);
  }

  if (!req.body.last_name || req.body.last_name == "") {
    return res.send(400);
  }

  if (!req.body.email || req.body.email == "") {
    return res.send(400);
  }

  if (!req.body.password || req.body.password == "") {
    return res.send(400);
  }

  // find user if they exist.
  User.findOne({'email': req.body.email}, function(err, user) {
    if (err) {
      return res.send(500);
    }

    if (user) {
      return res.send(409);
    } else {
      var newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      });
      newUser.save(function(err) {
        if (err) {
          throw err;
        }
        return res.redirect("/login");
      });
    }
  });
});
