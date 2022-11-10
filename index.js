const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000 
require("dotenv").config()
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3jlrk4o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  console.log(authHeader)

  if(!authHeader){
      return res.status(401).send({message: 'unauthorized access'});
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.TOKEN, function(err, decoded){
      if(err){
          return res.status(403).send({message: 'Forbidden access'});
      }
      req.decoded = decoded;
      next();
  })
}


async function run(){
    try{
        const serviceCollection=client.db("foodie").collection("services")
        const reviewCollection=client.db("foodie").collection("reviews")



        app.post('/jwt', (req, res) =>{
          const user = req.body;
          const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '1d'})
          res.send({token})
      }) 


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
        app.post("/services", async(req,res)=>{
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

        app.get("/myreviews",verifyJWT,async(req,res)=>{
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
        app.get("/reviews",async(req,res)=>{
          let query={};
          // console.log(req.query.service)
          if (req.query.service) {
            query = {
                service: req.query.service
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

        app.delete("/reviews/:id",verifyJWT,async(req,res)=>{
          const id=req.params.id
          console.log(id)

          const query={_id:ObjectId(id)}
          const reviews=await reviewCollection.deleteOne(query)
          res.send(reviews)

        })
        app.patch("/reviews/:id",verifyJWT,async(req,res)=>{
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