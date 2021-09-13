const express = require('express');
//define an express method
const router = express.Router();
//import the model for movie
const Movie = require('../models/Movies');


//implement asynchronous functions

async function query_one(q){
    if (q){
        let statusx = 'ok'
        return statusx
    }
    else{
        let statusx = 'ko'
        return statusx
    }
};

async function query_many(q){
    if (q.length > 0){
        let statusx = 'ok'
        return statusx
    }
    else{
        let statusx = 'ko'
        return statusx
    }
};

//----------ROUTES----------//
router.post('/', async (req, res) => {
    try{
        const movie_title = req.body.keyword;
        const filter = movie_title;
        const data = [];
        //console.log(filter);
        const docs = await Movie.find({title: {$regex: `${filter}`, $options: 'i'}}, {'_id': false}).limit(20); //i is no sensitive
        //console.log(docs)
        await query_many(docs)
            .then(item => {
                if (item == 'ok') {
                    // convert string to integer
                    for (let movie of docs){
                        var id_1 = parseInt(movie.movieId);
                        data.push({"movieId": id_1, "title": movie.title, "genres": movie.genres})
                    };
                    res.send(data);
                    //console.log(data)
                }
                else{
                    let msg = 'Movie title not exists';
                    res.status(404).json({message: msg});
                    //console.error(msg);
                }
            })
            .catch(err => console.error(err));
    }catch(err){
        res.sendStatus(400).json({ message:err });
    }
});

router.get('/:mId', async (req, res) => {
    try{
        const movie_Id = req.params.mId;
        const filter = { movieId: movie_Id }
        const data = [];
        var doc = await Movie.findOne(filter, {'_id': false});
        //console.log(doc)
        await query_one(doc)
            .then(item => {
                if (item == 'ok') {
                    var id_1 = parseInt(doc.movieId);
                    data.push({"movieId": id_1, "title": doc.title, "genres": doc.genres})
                    res.send(data);
                    //console.log(data)
                }
                else{
                    let msg = 'Movie ID not exists';
                    res.status(404).json({message: msg});
                    //console.error(msg);
                }
            })
            .catch(err => console.error(err));
    }catch(err){
        res.sendStatus(400).json({ message:err });
    }
});

//export the router we have define above
module.exports = router;
