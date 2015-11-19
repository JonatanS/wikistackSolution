var mongoose = require('mongoose');
var marked = require('marked');
mongoose.connect('mongodb://localhost/wikistack');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error: '));

var pageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true //use 'required' for validation
    },
    urlTitle: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed']    //these are the only valid options
    },
    date:     {
        type: Date,
        default: Date.now   //don't invoke the now() function here, otherwise, the date will not reflect the time when instance is created
    },
    author:   {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: {
        type: [String]
    }
});

//virtual property route (it's not a function!)
pageSchema.virtual('route').get(function () {
    return '/wiki/' + this.urlTitle;
});

pageSchema.virtual('renderedContent').get(function () {
    return marked(this.content);
});

//hook: using pre
pageSchema.pre('validate', function (next) {
    if (this.title) {
        this.urlTitle = this.title.replace(/\s/g, '_').replace(/\W/g, '');
    } else {
        this.urlTitle = Math.random().toString(36).substring(2, 7);
    }
    next();
});

//statics are functions on the Model, not the instance. Returns a promise
pageSchema.statics.findByTag = function (tag) {

    return Page.find({
        tags: {
            $in: [tag]  //$in expects an array of values to match
        }
    }).exec();

};

pageSchema.methods.findSimilar = function () {
    //return all pages that contain one or more of 'my' tags, excluding 'myself'
    return Page.find({
        tags: {
            //https://docs.mongodb.org/master/reference/operator/query/in/#use-the-in-operator-to-match-values
            //using $in will match any values in this.tags:
            $in: this.tags
        },
        _id: {
            $ne: this._id
        }
    }).exec();

};

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true    //cannot already exist in the model!
    }
});

userSchema.statics.findOrCreate = function (userInfo) {

    var self = this;

    return this.findOne({ email: userInfo.email }).exec()
        .then(function (user) {
            if (user === null) {
                return self.create(userInfo);
            } else {
                return user;
            }
        });

};

//in mongoose, we now have two models: Page, User
var Page = mongoose.model('Page', pageSchema);
var User = mongoose.model('User', userSchema);

module.exports = {
    Page: Page,
    User: User
};