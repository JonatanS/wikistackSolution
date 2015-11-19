var express = require('express');
var router = express.Router();
var models = require('../models');
var Promise = require('bluebird');
var Page = models.Page;
var User = models.User;
module.exports = router;

// /users
router.get('/', function (req, res, next) {

    User.find({}).exec()
        .then(function (users) {
            res.render('userlist', { users: users });
        })
        .then(null, next);

});

// /users/(dynamicvalue)
router.get('/:userId', function (req, res, next) {

    var findUser = User.findById(req.params.userId).exec(); //findById returns single object, not array
    var findPages = Page.find({ author: req.params.userId }).exec();

    //once all promises have been resolved
    //Promise.all returns new array, which we pass as info:
    Promise.all([findUser, findPages])  
        .then(function (info) {
            var foundUser = info[0];
            var foundPages = info[1];
            res.render('userpages', {
                pages: foundPages,
                user: foundUser
            });
        })
        .then(null, next);

});