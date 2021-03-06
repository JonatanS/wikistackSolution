//  /wiki sub router, routed from app.js
var express = require('express');
var router = express.Router();
var models = require('../models');  //finds the models from ../models/index.js!
var Page = models.Page;
var User = models.User;
module.exports = router;

// /wiki
router.get('/', function (req, res, next) {
    ///req.method === "GET" && req.url === "/wiki/"
    Page.find({}).exec()
        .then(function (pages) {
            res.render('index', { pages: pages });
        })
        //call error handling middleware in app.js
        //next is the second argument, so it is only called in case of error.
        .then(null, next);  


});

// /wiki
router.post('/', function (req, res, next) {

    User.findOrCreate({
        name: req.body.name,
        email: req.body.email
    }).then(function (user) {

        var newPage = new Page({
            title: req.body.title,
            content: req.body.content,
            status: req.body.status,
            tags: req.body.tags.split(','),
            author: user._id
        });

        return newPage.save();

    }).then(function (page) {
        res.redirect(page.route);
    }).then(null, next);

});

// /wiki/add
router.get('/add', function (req, res) {
    res.render('addpage');
});

router.get('/search', function (req, res, next) {

    var tagToSearch = req.query.search;

    Page.findByTag(tagToSearch)
        .then(function (pages) {
            res.render('index', { pages: pages });
        })
        .then(null, next);

});

// /wiki/(dynamic value)
router.get('/:urlTitle', function (req, res, next) {

    Page.findOne({ urlTitle: req.params.urlTitle })
        //author is ID. // Mongoose's populate() will populate author data (email, name) 
        //for page.author from users collection
        .populate('author') 
        .then(function (page) {
            res.render('wikipage', { page: page });
        })
        .then(null, next);

});

// /wiki/(dynamic value)
router.get('/:urlTitle/similar', function (req, res, next) {
    //if number came is as param, we'd use parseInt
    Page.findOne({ urlTitle: req.params.urlTitle })
        .then(function (page) {
            return page.findSimilar();
        })
        .then(function (pages) {
            res.render('index', { pages: pages });
        })
        .then(null, next);

});