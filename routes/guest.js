var mongoose = require('mongoose');
var Guest = mongoose.model('Guest');

exports.list = function(req, res) {
  Guest.find({}, null, {sort: {code: 1}}, function(err, guests) {
    res.render('guests', {
      guests: guests
    });
  });
};

exports.index = function(req, res) {
  res.render('rsvp-search', {
    value: "",
    message: "Your RSVP code can be found along with your invitation. Enter it below to find your RSVP information.",
    success: true
  });
}

exports.search = function(req, res) {
  if (!req.body.code) {
    res.render('rsvp-search', {
      value: "",
      message: "Don't forget to type in your code!",
      success: false
    });
    return;
  }

  Guest.find({code: req.body.code}, null, {sort: {name: 1}}, function(err, guests) {
    if (!guests || !guests.length) {
      res.render('rsvp-search', {
        value: req.body.code,
        message: "Couldn't find your code, are you sure you typed it in correctly?",
        success: false
      });
      return;
    }

    guests.forEach(function(guest) {
      if (guest.completed) {
        res.render('rsvp-list-completed', {guests: guests, completed: false});
      } else {
        res.render('rsvp-list', {guests: guests});
      }
      return false;
    });
  });
};

exports.rsvp = function(req, res) {
  var numGuests = req.body.guests.length;
  var numProcessed = 0;

  req.body.guests.forEach(function(guest) {
    numProcessed++;

    var data = {
      attending_ceremony: guest.ceremony === 'true' ? true : false,
      attending_reception: guest.reception === 'true' ? true : false,
      dietary_restriction: guest.dietary,
      completed: true,
      updated_at: Date.now()
    };

    Guest.findOneAndUpdate(
      { _id : guest.id },
      data,
      {},
      function(error, updatedGuest) {
        console.log('saved', updatedGuest.name, updatedGuest.updated_at);
        if (numProcessed === numGuests) {
          Guest.find({code: updatedGuest.code}, null, {sort: {name: 1}}, function(err, guests) {
            res.render('rsvp-list-completed', {guests: guests, completed: true});
          });
        }
      }
    );
  });
};











