const express = require('express');
//define an express method
const router = express.Router();
//import the model for movie
const Rating = require('../models/Ratings');


//implement asynchronous functions
async function queryExecute(y){
    try{
        const result = await Rating.find({movieId: y}, {'_id': false});
        return result;
    }
    catch(err){
        console.error(err.message);
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
        const movie_list = req.body.movieList;
        //console.log(movie_list);
        var qurlist = [];
        for (let movie of movie_list) {  
            await queryExecute(movie)
            .then(data => {
                data.forEach(element => {
                    qurlist.push(element)
                    //console.log(element) 
                    //console.log();
                });
            })
        }; 
        //console.log(qurlist);

        // check if there is no record in the returned list
        const data = [];
        await query_many(qurlist)
            .then(item => {
                if (item == 'ok') {
                    // convert strings to integers
                    qurlist.forEach(item => {
                        var id_1 = parseInt(item.userId);
                        var id_2 = parseInt(item.movieId);
                        data.push({"userId": id_1, "movieId": id_2, "rating": item.rating, "timestamp": item.timestamp})
                    });
                    res.send(data);
                    //console.log(data)
                }
                else{
                    let msg = 'Movies not exist';
                    res.status(404).json({message: msg});
                    //console.error(msg);
                }
            })
            .catch(err => console.error(err));
        //res.send(qurlist);
    }catch(err){
        res.sendStatus(400).json({ message:err });
    }
});

router.get('/:uId', async (req, res) => {
    try{
        const user_id = req.params.uId;
        const data = [];
        var docs = await Rating.find({ userId: `${user_id}` });
        //console.log(docs)
        await query_many(docs)
            .then(item => {
                if (item == 'ok') {
                    // convert strings to integers
                    docs.forEach(element => {
                        var id_1 = parseInt(element.userId);
                        var id_2 = parseInt(element.movieId);
                        data.push({"userId": id_1, "movieId": id_2, "rating": element.rating, "timestamp": element.timestamp})
                    });
                    res.send(data);
                    //console.log(data)
                }
                else{
                    let msg = 'User ID not exists';
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
