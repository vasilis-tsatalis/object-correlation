const mongoose = require('mongoose');

//create a Schema 
// which presents how the Movies looks

//create an object and describe the properties
const MovieSchema = new mongoose.Schema({
    movieId: { //built an object
        type: String,
        required: true
    },
    title: String,
    genres: String
});

//create Movie, Movies is our collection (table) in mongo
const Movie = mongoose.model('Movies', MovieSchema);
//export the movie schema-object
module.exports = Movie;
