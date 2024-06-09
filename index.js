const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const stripe= require('stripe')(process.env.STRIPE_SECRET_KEY)

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yk1xelo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const scholarshipCollection = client.db('ScholarDb').collection('scholarships');
    const appliedScholarshipCollection = client.db('ScholarDb').collection('appliedScholarship');
    const userCollection = client.db('ScholarDb').collection('users');
    const paymentCollection = client.db('ScholarDb').collection('payments');

    // scholarship related api
    app.get('/scholarships', async(req, res)=>{
      const result = await scholarshipCollection.find().toArray();
      res.send(result);
  })
  app.get('/scholarship/:id', async(req, res)=>{
    const id= req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await scholarshipCollection.findOne(query)
    res.send(result);
  })

  app.post('/scholarships', async(req,res)=>{
    const scholarship = req.body;
    const result = await scholarshipCollection.insertOne(scholarship);
    res.send(result);
  })

  app.patch('/scholarships', async(req, res)=>{
    const scholarshipId  = req.body.scholarshipId;
    console.log('scholarId: ',scholarshipId)
    const updatedData = req.body;
    const filter = {_id: new ObjectId(scholarshipId)}
    const option ={ upsert: true }
    const updatedDoc ={
      $set:{
              application_deadline:updatedData.application_deadline, 
              application_fees: updatedData.application_fees, 
              degree: updatedData.degree,
              posted_user_email: updatedData.posted_user_email,
              scholarship_category: updatedData.scholarship_category,
              scholarship_name:updatedData.scholarship_name,
              scholarship_post_date: updatedData.scholarship_post_date,
              service_charge: updatedData.service_charge,
              subject_category:updatedData.subject_category,
              tuition_fees: updatedData.tuition_fees,
              university_city: updatedData.university_city, 
              university_country: updatedData.university_country, 
              university_image:updatedData.university_image, 
              university_name: updatedData.university_name, 
              university_world_rank: updatedData.university_world_rank
      }
    }
    const result = await scholarshipCollection.updateOne(filter, updatedDoc,option)
    console.log(result)
    res.send(result)
  })

  app.delete('/scholarships/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await scholarshipCollection.deleteOne(query);
    res.send(result);
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('scholarship project is running')
})


app.listen(port, ()=>{
    console.log(`Scholarship is running on port ${port}`)
})