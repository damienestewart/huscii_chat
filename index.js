// Damiene Stewart
// Feb 24th, 2017

const express = require('express'),
  app = express(),
  session = require('express-session'),
  https = require('https'),
  cookieparser = require('cookie-parser'),
  cookie = require('cookie'),
  bodyparser = require('body-parser'),
  pug = require('pug'),
  logger = require('morgan'),
  path = require('path'),
  passport = require('passport'),
  mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  server = require('http').createServer(app),
  sio = require('socket.io')(server),
  lib = require('./lib.js')

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');

app.use(logger('dev'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

app.use(cookieparser());
app.use(session({secret: 'damieneSessionSecretValueBro', resave: true, saveUninitialized: true}));

app.use('/static', express.static('static'));

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/chat_app');

// get models
var User = require(path.join(__dirname, 'user.model.js'));

app.get('/', function(req, res) {
  if (req.session.user) {
    res.redirect('/chat');
  } else {
    res.redirect('/login');
  }
})

app.get('/register', function(req, res) {
  if (req.session.user) {
    res.redirect('/chat');
  }

  res.render('register');
})

app.get('/login', function(req, res) {
  if (req.session.user) {
    res.redirect('/chat');
  }

  res.render('login');
})

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

app.get('/chat', lib.checkLogin, function(req, res) {
  res.render('chat');
});

var Message = require(path.join(__dirname, 'message.model.js'));

// socket.io stuff here:
sio.on('connection', function(socket) {
  console.log('A client connected bro.');

  socket.on('join', function(data) {
    // get username from this list
    console.log(socket.id + ": " + data);
    Message.find({}).sort({created: 'asc'}).exec(function(err, docs) {
      if (err) {
        return console.log("oops");
      }

      return socket.emit('previous-messages', docs);
    })
  });

  socket.on('message', function(data) {
    var d = cookie.parse(data.cookie);
    var message = new Message({user: d.user, message: data.message})
    message.save(function(err) {
      if (err) {
        return console.log("Error occurred with socket: " + socket.id);
      }
      console.log("Message recieved");
      return sio.emit('message', message);
    })
  });
});

server.listen(3000);
