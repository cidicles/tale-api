'use strict';
const passport = require('passport');

module.exports = function(app) {
  const userList = require('../controllers/userController');

  // Creation
  app.route('/api/user')
    .post(userList.create_new_User);

  // Login
  app.route('/api/user/login')
    .post(passport.authenticate('local'), userList.login);

  // Logout
  app.route('/api/user/logout')
    .post(userList.logout);

};
