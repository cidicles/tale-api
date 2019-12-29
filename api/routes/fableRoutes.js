'use strict';
const expressJwt = require('express-jwt');
const constants = require('../../const');
const authenticate = expressJwt({secret : constants.jwtSecret});

module.exports = function(app) {
  const fableList = require('../controllers/fablesController');

  // Creation / Viewing Fable
  app.route('/api/fable/:locale/:page/:limit')
    .get(fableList.list_all_Fables);

  app.route('/api/fable')
    .post(authenticate, fableList.create_a_Fable);

  // Updating / Deletion of parent Fable
  app.route('/api/fable/:collectionId')
    .get(fableList.get_a_Fable)
    .put(authenticate, fableList.update_a_Fable)
    .delete(authenticate, fableList.delete_a_Fable);

  // Management of Fable Messages
  app.route('/api/fable/messages/:collectionId')
    .get(fableList.list_all_Fable_Messages)
    .post(authenticate, fableList.create_a_Fable_Message);

  app.route('/api/fable/messages/:collectionId/:messageId')
    .put(authenticate, fableList.update_a_Fable_Message)
    .delete(authenticate, fableList.delete_a_Fable_Message);

  // Management of Fable Likes
  app.route('/api/fable/like/:collectionId')
    .post(authenticate, fableList.create_a_Fable_Like);

  app.route('/api/fable/dislike/:collectionId')
    .post(authenticate, fableList.create_a_Fable_Dislike);

  // Management of Fable Characters
  app.route('/api/fable/characters/:collectionId')
    .post(authenticate, fableList.create_a_Fable_Character);

  app.route('/api/fable/characters/:collectionId/:characterId')
    .put(authenticate, fableList.update_a_Fable_Character)
    .delete(authenticate, fableList.delete_a_Fable_Character);

};
