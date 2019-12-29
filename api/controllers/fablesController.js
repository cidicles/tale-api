'use strict';

const mongoose = require('mongoose');
const Fable = mongoose.model('Fable');
const paginate = require('mongoose-pagination');

/**
 * @api {get} /fable/:locale/:page/:limit Get a paginated list of all Fables
 * @apiName List All Fables
 * @apiGroup Fables
 *
 * @apiParam {String} locale The sites current locale.
 * @apiParam {Int} page The current page.
 * @apiParam {Int} limit The amount to return.
 *
 */
exports.list_all_Fables = function(req, res) {
  Fable.find({}).
  where('locale').equals(req.params.locale)
  .sort({likesCount:-1})
  .paginate(parseInt(req.params.page), parseInt(req.params.limit), function(err, Fables, total) {
    handleError(err, res);
    res.json({
      "fables": Fables,
      "total": total
    });
  });
};

/**
 * @api {post} /fable Create a new Fable
 * @apiName Create a Fable
 * @apiGroup Fables
 *
 * @apiParam {String} name Name of the Fable.
 * @apiParam {String} locale Locale of the Fable.
 * @apiPermission authenticated
 *
 * @apiSuccessExample {json} Success:
 *     HTTP/1.1 200 OK
 *      {
 *          "__v": 0,
 *          "creator": "creator",
 *          "name": "name",
 *          "_id": "5a4349c4660c1b7bc200d1e2",
 *          "locale": [
 *              "en_us"
 *          ],
 *          "created_date": "2017-12-27T07:20:36.305Z",
 *          "messages": []
 *      }
 *
 */
exports.create_a_Fable = function(req, res) {
  let new_Fable = new Fable(req.body);
  new_Fable.creator = req.user;

  new_Fable.save(function(err, Fable) {
    handleError(err, res);
    res.json(Fable);
  });
};

/**
 * @api {get} /fable/:collectionId Get a Fable
 * @apiName Get a Fable
 * @apiGroup Fables
 *
 * @apiParam {String} collectionId Id of the Fable.
 *
 */
exports.get_a_Fable = function(req, res) {
  Fable.findById(req.params.collectionId, function(err, Fable) {
    handleError(err, res);
    res.json(Fable);
  });
};

/**
 * @api {put} /fable/:collectionId Update a Fable
 * @apiName Update a Fable
 * @apiGroup Fables
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiPermission authenticated creator
 *
 */
exports.update_a_Fable = function(req, res) {
  Fable.findOneAndUpdate({_id: req.params.collectionId}, req.body, {new: true}, function(err, Fable) {
    handleError(err, res);
    res.json(Fable);
  });
};

/**
 * @api {delete} /fable/:collectionId Delete a Fable
 * @apiName Delete a Fable
 * @apiGroup Fables
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiPermission authenticated creator
 *
 */
exports.delete_a_Fable = function(req, res) {
  Fable.remove({
    _id: req.params.collectionId
  }, function(err, Fable) {
    handleError(err, res);
    res.status(200).json({
      message: 'Fable successfully deleted'
    });
  });
};

/**
 * @api {get} /fable/:collectionId Get a single fables messages
 * @apiName List All Fable Messages
 * @apiGroup Fable Messages
 *
 * @apiParam {collectionId} The collectionId of the message object.
 *
 */
exports.list_all_Fable_Messages = function(req, res) {
  Fable.findById(req.params.collectionId, function(err, Fable) {
    handleError(err, res);
    res.status(200).json(Fable.messages);
  });
};

/**
 * @api {post} /fable/messages/:collectionId Create a Fable Message
 * @apiName Create a Fable Message
 * @apiGroup Fable Messages
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiParam {type} type Type of message.
 * @apiParam {body} body Content of the message.
 * @apiParam {character} body Character which the message belongs to.
 * @apiPermission authenticated creator
 *
 */
exports.create_a_Fable_Message = function(req, res) {
  Fable.findById(req.params.collectionId, function (err, fable) {
    handleError(err, res);
    if (req.user !== fable.creator){
      res.status(500).json({
        message: 'Not authorized.'
      });
    } else {
      if(req.body.type === 'video' && req.body.messages != null){
        fable.messages.push({
          messageType: req.body.type,
          body: req.body.messages.split('v=')[1],
          character: req.body.character,
          date: new Date()
        });
      } else {
        fable.messages.push({
          messageType: req.body.type,
          body: req.body.messages,
          character: req.body.character,
          date: new Date()
        });
      }
      fable.save(function(err){
        handleError(err, res);
        res.status(200).json({
          message: 'Fable Message successfully created.'
        });
      });
    }
  })
};

/**
 * @api {post} /fable/like/:collectionId Create a Fable Like
 * @apiName Create a Fable Like
 * @apiGroup Fable Likes
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiPermission authenticated
 *
 */
exports.create_a_Fable_Like = function(req, res) {
  Fable.findById(req.params.collectionId, function (err, fable) {
    handleError(err, res);
    const hasLiked = fable.likes.filter(like => (like.user === req.user)).length > 0;
    const hasDisliked = fable.dislikes.filter(dislike => (dislike.user === req.user)).length > 0;

    if(hasLiked) {
      return res.status(200).json({
        message: 'You cannot like more than once.'
      });
    }

    if(hasDisliked) {
      const dislikes = fable.dislikes.filter(dislike => (dislike.user !== req.user));
      fable.dislikes = dislikes;
      fable.dislikesCount = fable.dislikes.length;
    }

    if(req.user) {
      fable.likes.push({
        user: req.user,
        date: new Date()
      });
      fable.likesCount = fable.likes.length;
  
      fable.save(function(err) {
        handleError(err, res);
         res.status(200).json({
          message: 'Fable Like successfully created.',
          likesCount: fable.likesCount,
          dislikesCount: fable.dislikesCount
        });
      });
    }
  })
};

/**
 * @api {post} /fable/dislike/:collectionId Create a Fable dislike
 * @apiName Create a Fable Disike
 * @apiGroup Fable Likes
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiPermission authenticated
 *
 */
exports.create_a_Fable_Dislike = function(req, res) {
  Fable.findById(req.params.collectionId, function (err, fable) {
    handleError(err, res);
    const hasDisliked = fable.dislikes.filter(dislike => (dislike.user === req.user)).length > 0;
    const hasLiked = fable.likes.filter(like => (like.user === req.user)).length > 0;

    if(hasDisliked) {
      return res.status(200).json({
        message: 'You cannot dislike more than once.'
      });
    }

    if(hasLiked) {
      const likes = fable.likes.filter(like => (like.user !== req.user));
      fable.likes = likes;
      fable.likesCount = fable.likes.length;
    }

    if(req.user) {
      fable.dislikes.push({
        user: req.user,
        date: new Date()
      });
      fable.dislikesCount = fable.dislikes.length;
  
      fable.save(function(err) {
        handleError(err, res);
         res.status(200).json({
          message: 'Fable dislike successfully created.',
          likesCount: fable.likesCount,
          dislikesCount: fable.dislikesCount
        });
      });
    }
  })
};

/**
 * @api {put} /fable/messages/:collectionId/:messageId Update a Fable Message
 * @apiName Update a Fable Message
 * @apiGroup Fable Messages
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiParam {String} messageId Id of the Message.
 * @apiPermission authenticated creator
 *
 */
exports.update_a_Fable_Message = function(req, res) {
  Fable.findById(req.params.collectionId, function(err, fable) {
    if (req.user !== fable.creator){
      res.status(500).json({
        message: 'Not authorized.'
      });
    } else {
      //
      let subDoc = fable.messages.id(req.params.messageId);
      if(!subDoc){
        res.status(500).json({
          message: 'Comment not found.'
        });
      }
      subDoc.set({
        "body": req.body.messages
      });
      fable.save(function(err){
        handleError(err, res);
        res.status(200).json({
          message: 'Fable Message successfully updated.'
        });
      });
    }
  });
};

/**
 * @api {delete} /fable/messages/:collectionId/:messageId Delete a Fable Message
 * @apiName Delete a Fable Message
 * @apiGroup Fable Messages
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiParam {String} messageId Id of the Message.
 * @apiPermission authenticated creator
 *
 */
exports.delete_a_Fable_Message = function(req, res) {
  Fable.findById(req.params.collectionId, function(err, fable) {
    let subDoc = fable.messages.id(req.params.messageId).remove();
    fable.save(function(err){
      handleError(err, res);
      res.status(200).json({
        message: 'Fable Message successfully deleted.'
      });
    });
  });
};

////////////////////////////////

/**
 * @api {post} /fable/characters/:collectionId Create a Fable Character
 * @apiName Create a Fable Character
 * @apiGroup Fable Characters
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiParam {String} [name] Name of Character.
 * @apiPermission authenticated creator
 *
 */
exports.create_a_Fable_Character = function(req, res) {
  Fable.findById(req.params.collectionId, function (err, fable) {
    handleError(err, res);
    if (req.user !== fable.creator){
      res.status(500).json({
        message: 'Not authorized.'
      });
    } else {
      fable.characters.push({
        name: req.body.name
      });
      fable.save(function(err){
        handleError(err, res);
        res.status(200).json({
          message: 'Fable Character successfully created.'
        });
      });
    }
  })
};

/**
 * @api {put} /fable/characters/:collectionId/:characterId Update a Fable Characters
 * @apiName Update a Fable Characters
 * @apiGroup Fable Characters
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiParam {String} messageId Id of the Message.
 * @apiParam {String} [name] Name of Character.
 * @apiPermission authenticated creator
 *
 */
exports.update_a_Fable_Character = function(req, res) {
  Fable.findById(req.params.collectionId, function(err, fable) {
    if (req.user !== fable.creator){
      res.status(500).json({
        message: 'Not authorized.'
      });
    } else {
      //
      let subDoc = fable.characters.id(req.params.messageId);
      if(!subDoc){
        res.status(500).json({
          message: 'Character not found.'
        });
      }
      subDoc.set({
        "name": req.body.name
      });
      fable.save(function(err){
        handleError(err, res);
        res.status(200).json({
          message: 'Fable Character successfully updated.'
        });
      });
    }
  });
};

/**
 * @api {delete} /fable/characters/:collectionId/:characterId Delete a Fable Character
 * @apiName Delete a Fable Character
 * @apiGroup Fable Messages
 *
 * @apiParam {String} collectionId Id of the Fable.
 * @apiParam {String} messageId Id of the Character.
 * @apiPermission authenticated creator
 *
 */
exports.delete_a_Fable_Character = function(req, res) {
  Fable.findById(req.params.collectionId, function(err, fable) {
    let subDoc = fable.characters.id(req.params.characterId).remove();
    fable.save(function(err){
      handleError(err, res);
      res.status(200).json({
        message: 'Fable Character successfully deleted.'
      });
    });
  });
};

/* Helpers
------------------------*/

function handleError(err, res){
  if (err) {
    res.status(500).send(err);
  }
}
