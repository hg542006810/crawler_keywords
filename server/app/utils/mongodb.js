'use strict';

const { format } = require('util');
const { mongodbUserName, mongodbPort, mongodbPassword, mongodbHost, mongodbDatabase } = require('../../config/db');
const mongoose = require('mongoose');

mongoose.connect(format('mongodb://%s:%d/%s', mongodbHost, mongodbPort, mongodbDatabase), {
  user: mongodbUserName,
  pass: mongodbPassword,
}, err => {
  if (err) {
    console.log('connect to %s error: ', mongodbDatabase, err.message);
  }
});

module.exports = mongoose;

