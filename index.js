const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors())
// const coresConfig ={
//     origin: '',
//     Credential: true,
//     methods:['GET','POST', 'PUT', 'DELETE']
// }
// app.use(cors(coresConfig))
// app.options("",cors(coresConfig))


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kfqp20s.mongodb.net/?retryWrites=true&w=majority`;

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

        app.get('/', (req, res) => {
            res.send("TOY Request Called")
        })

        const toyCollection = client.db('toyManager').collection('toys')
        const bookingCollection = client.db('toyBooking').collection('bookings')

        app.post('/toys', async (req, res) => {
            const data = req.body;

            const result = await toyCollection.insertOne(data)
            res.send(result)
        })


        



        app.get('/toys', async (req, res) => {
            const toys = toyCollection.find()
            const result = await toys.toArray()
            res.send(result)
        })

        app.get('/toys/:text', async (req, res) => {
            if (req.params.text == 'Marvel' || req.params.text == 'Star Light' || req.params.text == 'Transformers') {
                const result = await toyCollection.find({ category: req.params.text }).toArray();
                return res.send(result)
            }
            const result = await toyCollection.find({}).toArray();
            res.send(result)

        })

        app.get('/getToys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query);
            res.send(result)
        })

        //=====find my toy======

        //=====bookings=====

        app.post('/bookings', async (req, res) => {
            const data = req.body;

            const result = await bookingCollection.insertOne(data)
            res.send(result)
        })

        app.get('/bookings', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const toys = bookingCollection.find(query)
            const result = await toys.toArray()
            res.send(result)
        })

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.findOne(query);
            res.send(result)
        })




        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result)
        })

        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const option = { upsert: true }
            const filter = { _id: new ObjectId(id) }
            const updatedToy = req.body;
            const toy = {
                $set: {
                    name: updatedToy.name,
                    category: updatedToy.category,
                    toyName: updatedToy.toyName,
                    photo: updatedToy.photo,
                    price: updatedToy.price,
                    quantity: updatedToy.quantity
                }

            }
            const result = await bookingCollection.updateOne(filter, toy, option);
            res.send(result)
        })








        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`listening to the port ${port}`);
})