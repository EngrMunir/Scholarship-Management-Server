const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe= require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.niwwhqe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const reviewCollection = client.db('ScholarDb').collection('review');

    // scholarship related api
    app.get('/scholarships', async(req, res)=>{
        // console.log('pagination query',req.query)
        const page= parseInt(req.query.page);
        const size = parseInt(req.query.size);
      // if(page){
        const result = await scholarshipCollection.find()
        .skip(page * size)
        .limit(size)
        .toArray();
        res.send(result);
      // }
      // else{
      //   const result = await scholarshipCollection.find().toArray();
      //   res.send(result);
      // }
        
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

    // applied Scholarship related api
    app.get('/applied-scholarship', async(req, res)=>{
      const email = req.query?.email;
      if(email){
        console.log(email)
        const query ={ user_email: email};
        const result = await appliedScholarshipCollection.find(query).toArray();
        res.send(result)
      }
     else{
      const result = await appliedScholarshipCollection.find().toArray();
      res.send(result)
     }
    })

    app.get('/applied-scholarship/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const  result = await appliedScholarshipCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/applied-scholarships', async(req, res)=>{
      const appliedScholarshipData= req.body;
      const result = await appliedScholarshipCollection.insertOne(appliedScholarshipData);
      console.log(result)
      res.send(result);
    })

    app.patch('/applied-scholarships/update', async(req, res)=>{
      const applicationId  = req.body.applicationId;
      console.log('scholarId: ',applicationId)
      const updatedData = req.body;
      const filter = {_id: new ObjectId(applicationId)}
      const option ={ upsert: true }
      const updatedDoc ={
        $set:{
          applicant_phone_number:updatedData.applicant_phone_number,
          applicant_photo: updatedData.applicant_photo,
          applicant_address:updatedData.applicant_address,
          applicant_gender: updatedData.applicant_gender,
          applicant_applying_degree: updatedData.applicant_applying_degree,
          application_fees:updatedData.application_fees,
          sevice_charge:updatedData.service_charge,
          ssc_result: updatedData.ssc_result,
          hsc_result: updatedData.hsc_result,
          study_gap: updatedData.study_gap,
          university_name: updatedData.university_name,
          scholarship_name:updatedData.scholarship_name,
          scholarship_category: updatedData.scholarship_category,
          subject_category: updatedData.subject_category,
          user_name: updatedData.user_name,
          user_email: updatedData.user_email,
          scholarship_id: updatedData.scholarship_id,
          current_date: updatedData.current_date, //convert utc
          status:updatedData.status,
        }
      }
      const result = await appliedScholarshipCollection.updateOne(filter, updatedDoc,option)
      console.log(result)
      res.send(result)
    })

    app.patch('/applied-scholarships', async(req, res) =>{
      const {appliedId, feedback } = req.body;
      console.log(typeof appliedId);
      const filter = {_id: new ObjectId(appliedId)};
      const option = { upsert: true};
      const updatedDoc = {
        $set:{
          feedback: feedback
        }
      }
      const result = await appliedScholarshipCollection.updateOne(filter, updatedDoc, option);
      // console.log(result)
      res.send(result);
    })

    app.delete('/applied-scholarships/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)}
      const result = await appliedScholarshipCollection.deleteOne(query);
      console.log(result)
      res.send(result);
    })

    // update status rejected
    app.patch('/applied-scholarships/cancel', async(req, res) =>{
      const {appliedId, status } = req.body;
      console.log(typeof appliedId);
      const filter = {_id: new ObjectId(appliedId)};
      const option = { upsert: true};
      const updatedDoc = {
        $set:{
          status: status
        }
      }
      const result = await appliedScholarshipCollection.updateOne(filter, updatedDoc, option);
      console.log('rejected ',result)
      res.send(result);
    })


    // users related api
    app.get('/users', async(req, res)=>{
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    app.get('/users/:email', async(req, res)=>{
      const email=  req.params.email;
      console.log('email rcv',email)
      const query={email: email}
      const result = await userCollection.find(query).toArray();
      // console.log(result)
      res.send(result);
    })
    app.post('/users', async(req, res)=>{
      const user = req.body;
      // insert email if user doesn't exists:
      const query= {email: user.email }
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exists', insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })
    app.patch('/users', async(req, res)=>{
      const {id, role} = req.body;
      // console.log('user id ',id,'role ',role)
      // console.log(typeof id)
      const filter = {_id: new ObjectId(id)}
      const updatedDoc ={
        $set:{
          role:role
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
    app.delete('/users/:id', async(req,res)=>{
      const id = req.params.id;
      // console.log('delete', id)
      const query={_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })

    // payment intent
    app.post('/create-payment-intent', async(req, res) =>{
      const { price } = req.body;
      const amount = parseInt(price*100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount:amount,
        currency:'usd',
        payment_method_types:['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })


    app.post('/payments', async(req, res)=>{
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      
      console.log('payment info', paymentResult)
      res.send(paymentResult)
    })

    // review related api
    app.get('/review',async(req,res)=>{
      const email=req.query.email;
      if(email){
        const query = {reviewer_email: email }
        const result = await reviewCollection.find(query).toArray();
        res.send(result)
      }
      else{
        const result = await reviewCollection.find().toArray();
        res.send(result)
      }
      
    })
    app.get('/review/:id',async(req,res)=>{
      const id=req.params.id;
      const query = {_id: new ObjectId(id) }
      const result = await reviewCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/review', async(req,res)=>{
      const review = req.body;
      console.log(review);
      const reviewResult = await reviewCollection.insertOne(review);
      res.send(reviewResult)
    } )

    app.patch('/review', async(req, res)=>{
      const id  = req.body.review_id;
      console.log('reviewId: ',id)
      const updatedData = req.body;
      const filter = {_id: new ObjectId(id)}
      const option ={ upsert: true }
      const updatedDoc ={
        $set:{
          review_point: updatedData.review_point,
          review_comment: updatedData.review_comment,
          review_date: updatedData.review_date,
          scholarship_name: updatedData.scholarship_name,
          university_name: updatedData.university_name,
          scholarship_id:updatedData.scholarship_id, 
          reviewer_name:updatedData.reviewer_name,
          reviewer_email: updatedData.reviewer_email,
        }
      }
      const result = await appliedScholarshipCollection.updateOne(filter, updatedDoc,option)
      console.log(result)
      res.send(result)
    })

    app.delete('/review/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req, res)=>{
    res.send('Scholarship project is running')
})

app.listen(port, ()=>{
    console.log(`Scholarship is running on port ${port}`)
})