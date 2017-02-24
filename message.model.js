var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  user: String,
  created: { type: Date, default: Date.now },
  message: String
});

module.exports = mongoose.model('Message', messageSchema);
