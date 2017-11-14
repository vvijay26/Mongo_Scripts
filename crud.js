db.getCollection('companies').find({})


use crunchbase

db.companies.find({"_id": "New2"})

db.companies.insertOne({"title": "Test", "_id" : "New10"})

db.companies.insertMany([
{"title": "Test", "_id" : "New4"},
{"title": "Test", "_id" : "New5"},
{"title": "Test", "_id" : "New2"},
{"title": "Test", "_id" : "New6"}
],
{
    ordered:false
})

use video

db.movieDetails.find({ rated : "PG-13"}).count()

db.movieDetails.find({ "tomato.meter" : 98}).count()

db.movieDetails.find({ writers : ["Ethan Coen", "Joel Coen"]}).pretty()

db.movieDetails.find({ writers : {$in:["Ethan Coen", "Joel Coen", "Notpossible"]}}).pretty()

db.movieDetails.find({ "actors.0" : "Jeff Bridges"}).count()

db.movieDetails.find({}).count()

db.movieDetails.find({ "actors.0" : "Jeff Bridges"},{title:1,_id:0})

db.movieDetails.find({ runtime : {$gt : 90, $lt : 92}},{title:1,_id:0})

db.movieDetails.find({ "tomato.meter" : {$gt : 98}, runtime : {$gt : 90, $lte : 92}},{title:1,_id:0})


test.hasNext()





