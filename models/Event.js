const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  allowGuests: {
    type: Boolean,
    default: false
  },
  attendees: [{
    email: {
      type: String,
      required: true
    },
    going: {
      type: Boolean,
      required: true
    },
    guestNumber: {
      type: Number,
      default: 0
    }
  }]
});

module.exports = mongoose.model('Event', eventSchema);
