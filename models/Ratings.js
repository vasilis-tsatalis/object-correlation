const mongoose = require('mongoose');

//create a Schema 
// which presents how the Ratings looks

//create an object and describe the properties
const RatingSchema = new mongoose.Schema({
    userId: { //built an object
        type: String,
        required: true
    },
    movieId: { //built an object
        type: String,
        required: true
    },
    rating: String,
    timestamp: String
});

//create Rating, Ratings is our collection (table) in mongo
const Rating = mongoose.model('Ratings', RatingSchema);
//export the rating schema-object
module.exports = Rating;
