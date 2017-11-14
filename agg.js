db.companies.find({"ipo" : {$exists :true}})

db.companies.find({})


db.companies.aggregate([
{$match: { "name": "Digg", "founded_year" : 2004}},
{$unwind:"$funding_rounds"},
{$unwind:"$funding_rounds.investments"},
{$sort: { name : 1}},
{$skip: 0},
{$limit : 20},
{$project : {_id:0, name:1, founded_year:1, funding_years:"$funding_rounds"}}
])

db.companies.aggregate([
    { $match: {"funding_rounds.investments.financial_org.permalink": "greylock" } },
    { $project: {
        _id: 0,
        name: 1,
        founded_year: 1,
        rounds: { $filter: {
            input: "$funding_rounds",
            as: "round",
            cond: { $gte: ["$$round.raised_amount", 100000000] } } }
    } },
    { $match: {"rounds.investments.financial_org.permalink": "greylock" } },    
]).pretty()
    
db.companies.aggregate([
    { $match: { "founded_year": 2004 } },
    { $project: {
        _id: 0,
        name: 1,
        founded_year: 1,
        total_rounds: { $size: "$funding_rounds" }
    } }
]).pretty()    
    
db.companies.aggregate([
    { $match: { "funding_rounds": { $exists: true, $ne: [ ]} } },
    { $project: {
        _id: 0,
        name: 1,
        largest_round: { $max: "$funding_rounds.raised_amount" }
    } }
])    

db.companies.aggregate([
    { $match: { "funding_rounds": { $exists: true, $ne: [ ]} } },
    { $project: {
        _id: 0,
        name: 1,
        total_funding: { $sum: "$funding_rounds.raised_amount" }
    } }
])


db.companies.aggregate([
    { $group: {
        _id: { founded_year: "$founded_year" },
        average_number_of_employees: { $avg: "$number_of_employees" }
    } },
    { $sort: { average_number_of_employees: -1 } }
    
])

db.companies.aggregate( [
    { $match : { founded_year : 2001 } },
    { $project : { _id: 0, name : 1, number_of_employees: 1 } },
    { $sort : { number_of_employees : -1 } }
] )


db.companies.aggregate( [
    { $match: { "relationships.person": { $ne: null } } },
    { $project: { relationships: 1, _id: 0 } },
    { $unwind: "$relationships" },
    { $group: {
        _id: "$relationships.person",
        count: { $sum: 1 }
    } },
    { $sort: { count: -1 } }
] )


db.companies.aggregate( [
    { $match: { "relationships.person": { $ne: null } } },
    { $project: { relationships: 1, _id: 0 } },
    { $unwind: "$relationships" }])
    
db.companies.aggregate([
    {$match:{"founded_year": {$gte : 2012} }},
    {$project:{ name: 1, founded_year:1, _id: 0 } },
    { $group: {
        _id: {founded_year: "$founded_year"},
        companies: { $push: "$name" }
    } },
    { $sort : {"_id.founded_year" : -1}}
]).pretty()
    
db.companies.aggregate([
    { $match: { funding_rounds: { $ne: [ ] } } },
    { $unwind: "$funding_rounds" },
    { $sort: { "funding_rounds.funded_year": 1,
               "funding_rounds.funded_month": 1,
               "funding_rounds.funded_day": 1 } },
    { $group: {
        _id: { company: "$name" },
        funding: {
            $push: {
                amount: "$funding_rounds.raised_amount",
                year: "$funding_rounds.funded_year" 
            } }
    } },
] ).pretty()    
    
db.companies.aggregate([
    { $match: { funding_rounds: { $exists: true, $ne: [ ] } } },
    { $unwind: "$funding_rounds" },
    { $sort: { "funding_rounds.funded_year": 1,
               "funding_rounds.funded_month": 1,
               "funding_rounds.funded_day": 1 } },
    { $group: {
        _id: { company: "$name" },
        first_round: { $first: "$funding_rounds" }, 
        last_round: { $last: "$funding_rounds" },
        num_rounds: { $sum: 1 },
        total_raised: { $sum: "$funding_rounds.raised_amount" }
    } },
    { $project: {
        _id: 0,
        company: "$_id.company",
        first_round: {
            amount: "$first_round.raised_amount",
            article: "$first_round.source_url",
            year: "$first_round.funded_year"
        },
        last_round: {
            amount: "$last_round.raised_amount",
            article: "$last_round.source_url",
            year: "$last_round.funded_year"
        },
        num_rounds: 1,
        total_raised: 1,
    } },
    { $sort: { total_raised: -1 } }
] ).pretty()    
    
db.inventory.insertMany( [
  { item: "journal", status: "A", size: { h: 14, w: 21, uom: "cm" }, instock: [ { warehouse: "A", qty: 5 } ] },
  { item: "notebook", status: "A",  size: { h: 8.5, w: 11, uom: "in" }, instock: [ { warehouse: "C", qty: 5 } ] },
  { item: "paper", status: "D", size: { h: 8.5, w: 11, uom: "in" }, instock: [ { warehouse: "A", qty: 60 } ] },
  { item: "planner", status: "D", size: { h: 22.85, w: 30, uom: "cm" }, instock: [ { warehouse: "A", qty: 40 } ] },
  { item: "postcard", status: "A", size: { h: 10, w: 15.25, uom: "cm" }, instock: [ { warehouse: "B", qty: 15 }, 
  { warehouse: "C", qty: 35 } ] }
]);   
  
db.inventory.find( { status: "A" }, { item: 1, status: 1, _id: 0 } )

db.inventory.find( { status: "A" }, {  "instock": 1 } )

db.students.insertMany( [
{ semester : 1, grades : [ 70, 87, 90 ] },
{ semester : 1, grades : [ 90, 88, 92 ] },
{ semester : 1, grades : [ 85, 100, 90 ] },
{ semester : 2, grades : [ 79, 85, 80 ] },
{ semester : 2, grades : [ 88, 88, 92 ] },
{ semester : 2, grades : [ 95, 90, 96 ] }
]);

db.students.find( { semester: 1, grades: { $gte: 85 } },{ semester:1, "grades.$": 1 } ).forEach(function(doc){
    print(doc.semester+" test")
})


db.inventory.insertMany([
   { item: "journal", qty: 25, tags: ["blank", "red"], dim_cm: [ 14, 21 ] },
   { item: "notebook", qty: 50, tags: ["red", "blank"], dim_cm: [ 14, 21 ] },
   { item: "paper", qty: 100, tags: ["red", "blank", "plain"], dim_cm: [ 14, 21 ] },
   { item: "planner", qty: 75, tags: ["blank", "red"], dim_cm: [ 22.85, 30 ] },
   { item: "postcard", qty: 45, tags: ["blue"], dim_cm: [ 10, 15.25 ] }
]);
   
db.inventory.find( { tags: ["red", "blank"] } )

db.inventory.find( { tags: { $all: ["red", "blank"] } } )

db.inventory.find( { tags: "red" } )

db.students.find( { "grades.$": {$gt:88} } )