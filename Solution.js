/* Using the following atlas replica sets, all these aggregation statements have been written */
mongo "mongodb://cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/aggregations?replicaSet=Cluster0-shard-0" --authenticationDatabase admin --ssl -u m121 -p aggregations --norc

var pipeline = [{$match: {"imdb.rating":{$gte: 7},"genres":{$nin:["Crime","Horror"]},$or:[{"rated":"PG"},{"rated":"G"}],"languages":{$all:["English","Japanese"]}}},{ $project: { _id:0,title:1,rated:1} }]
db.movies.aggregate(pipeline).itcount()

db.movies.aggregate([{ $project: { _id:0,title:1} },{ $project : {title:1, movie_titles : { $split: ["$title", " "] } } },{$project: {title:1,numberOfTitles: { $size: "$movie_titles" } } },{$match:{numberOfTitles:1}},{$project: {title:1}}]).itcount()

favorites = [ "Sandra Bullock", "Tom Hanks", "Julia Roberts", "Kevin Spacey", "George Clooney"]


db.movies.aggregate([
	{ $match: {"tomatoes.viewer.rating":{$gte: 3},"countries":"USA"}},
	{ $project: {$setIntersection:[cast,$favorites] } }
	])

var favorites = [
  "Sandra Bullock",
  "Tom Hanks",
  "Julia Roberts",
  "Kevin Spacey",
  "George Clooney"]

db.movies.aggregate([
  {
    $match: {
      "tomatoes.viewer.rating": { $gte: 3 },
      countries: "USA",
      cast: {
        $in: favorites
      }
    }
  },
  {
    $project: {
      _id: 0,
      title: 1,
      "tomatoes.viewer.rating": 1,
      num_favs: {
        $size: {
          $setIntersection: [
            "$cast",
            favorites
          ]
        }
      }
    }
  },
  {
    $sort: { num_favs: -1, "tomatoes.viewer.rating": -1, title: -1 }
  },
  {
    $skip: 24
  },
  {
    $limit: 1
  }
])


db.movies.aggregate([
  {
    $match: {
      year: { $gte: 1990 },
      languages: { $in: ["English"] },
      "imdb.votes": { $gte: 1 },
      "imdb.rating": { $gte: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      title: 1,
      "imdb.rating": 1,
      "imdb.votes": 1,
      normalized_rating: {
        $avg: [
          "$imdb.rating",
          {
            $add: [
              1,
              {
                $multiply: [
                  9,
                  {
                    $divide: [
                      { $subtract: ["$imdb.votes", 5] },
                      { $subtract: [1521105, 5] }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  { $sort: { normalized_rating: 1 } },
  { $limit: 1 }
])

/*Second week lab*/

/* First problem
In the last lab, we calculated a normalized rating that required us to know what the minimum and maximum values for imdb.votes were. These values were found using the $group stage!

For all films that won at least 1 Oscar, calculate the standard deviation, highest, lowest, and average imdb.rating. Use the sample standard deviation expression.

HINT - All movies in the collection that won an Oscar begin with a string resembling one of the following in their awards field
*/

db.movies.aggregate(
   [ { 
       $match : 
         {
          "imdb.rating": { "$exists" : 1 },
          "awards" : { $regex: /Won.*Oscar.*/i }
         }
     },
     {
       $group:
         {
           _id: null,
           highestRating: { $max: "$imdb.rating" },
           lowestRating: { $min: "$imdb.rating" },
           avgRating: { $avg: "$imdb.rating" },
           deviation: { $stdDevSamp: "$imdb.rating" }
         }
     }
   ]
)

/*
Let's use our increasing knowledge of the Aggregation Framework to explore our movies collection in more detail. We'd like to calculate how many movies every cast member has been in and get an average imdb.rating for each cast member.

What is the name, number of movies, and average rating (truncated to one decimal) for the cast member that has been in the most number of movies with English as an available language?

Provide the input in the following order and format
{ "_id": "First Last", "numFilms": 1, "average": 1.1 }
*/
db.movies.aggregate(
   [ { 
       $match : 
         {
          "imdb.rating": { "$exists" : 1 },
          "languages": "English"
         }
     },
     {
       $unwind:"$cast"
     },
     {
       $group:
         {
           _id: "$cast",
           avgRating: { $avg: "$imdb.rating" },
           numMov: {$sum: 1}
         }
     },
     {
       $sort:
         {
           numMov: -1, avgRating: -1
         }
     }, 
     {
       $limit: 100
     }    
   ]
)

/*{ "_id": "John Wayne", "numFilms": 107, "average": 6.4 }*/

/*Which alliance from air_alliances flies the most routes with either a Boeing 747 
or an Airbus A380 (abbreviated 747 and 380 in air_routes)?*/
db.air_alliances.aggregate([
  {
   $lookup:
   {
       from: "air_routes",
       localField: "airlines",
       foreignField: "airline.name",
       as: "docs"
   }
  },
  { 
       $match : 
         {
          $or :[{"docs.airplane":{ $regex: /380/i }},{"docs.airplane":{ $regex: /747/i }}]
         }
  },
     {
       $unwind:"$docs"
     },
  { 
       $match : 
         {
          $or :[{"docs.airplane":{ $regex: /380/i }},{"docs.airplane":{ $regex: /747/i }}]
         }
    },
     {
       $group:
         {
           _id: "$name",
           sumRoutes: {$sum: 1}
      }
  }   
 ]
)

/*Now that you have been introduced to $graphLookup, let's use it to solve an interesting need. 
You are working for a travel agency and would like to find routes for a client! For this exercise, 
we'll be using the air_airlines, air_alliances, and air_routes collections in the aggregations database.

The air_airlines collection will use the following schema:*/