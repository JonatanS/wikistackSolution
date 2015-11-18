var express = require('express');
var router = express.Router();
var models = require('../models');
var Page = models.Page;
var User = models.User;
module.exports = router;

// /wiki
router.get('/', function (req, res, next) {

    Page.find({}).exec()
        .then(function (pages) {
            res.render('index', { pages: pages });
        })
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
        .populate('author')
        .then(function (page) {
            res.render('wikipage', { page: page });
        })
        .then(null, next);

});

// /wiki/(dynamic value)
router.get('/:urlTitle/similar', function (req, res, next) {

    Page.findOne({ urlTitle: req.params.urlTitle })
        .then(function (page) {
            return page.findSimilar();
        })
        .then(function (pages) {
            res.render('index', { pages: pages });
        })
        .then(null, next);

});