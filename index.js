const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000 
require("dotenv").config()
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3jlrk4o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        const serviceCollection=client.db("foodie").collection("services")
        const reviewCollection=client.db("foodie").collection("reviews")



        app.get("/services",async(req,res)=>{
          const count=parseInt(req.query.count);
          // console.log(count)
          if(count){

            const query={}
            const cursor= serviceCollection.find(query)
            const services=await cursor.limit(3).toArray()
            res.send(services)
          }
          else{
            const query={}
            const cursor= serviceCollection.find(query)
            const services=await cursor.toArray()
            res.send(services)

          }
        })
        app.post("/services",async(req,res)=>{
          const service=req.body;

          console.log(service)
         
          const result=await serviceCollection.insertOne(service)
          res.send(result)
        })

        app.get("/services/:id",async(req,res)=>{
          const id=req.params.id;

          const query={_id:ObjectId(id)}

          const service = await serviceCollection.findOne(query)
          res.send(service)
        })

        app.get("/reviews",async(req,res)=>{
          let query={};
          // console.log(req.query.service)
          if (req.query.service) {
            query = {
                service: req.query.service
            }
        }
          if (req.query.name) {
            query = {
                name: req.query.name
            }
        }
        
          const cursor= reviewCollection.find(query).sort({date:-1})
          const reviews= await cursor.toArray()
          res.send(reviews)
        })
       
        app.post("/reviews",async(req,res)=>{
          const review=req.body;
          const date =new Date(Date.now())
          
          console.log(review)
          // console.log(date)

          const result=await reviewCollection.insertOne(review)
          res.send(result)
        })

        app.delete("/reviews/:id",async(req,res)=>{
          const id=req.params.id
          console.log(id)

          const query={_id:ObjectId(id)}
          const reviews=await reviewCollection.deleteOne(query)
          res.send(reviews)

        })
        app.patch("/reviews/:id",async(req,res)=>{
          const id=req.params.id
          console.log(id)
          const status = req.body.upValue
          console.log(status)
          const query = { _id: ObjectId(id) }
          const updatedDoc = {
              $set:{
                  description: status
              }
          }
          const result = await reviewCollection.updateOne(query, updatedDoc);
          res.send(result);

        })
    }
    finally{

    }
}
run().catch(er=>console.error(er))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})