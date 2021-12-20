const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fileUpload = require('express-fileupload')

const app = express();
const port = process.env.PORT || 5000;

//middleaware
app.use(cors());
app.use(express.json());
app.use(fileUpload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7s5ai.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();

        const database = client.db("colorCastle-database");
        const serviceCollection = database.collection("colorCastleServices");
        const reviewsCollection = database.collection("colorCastleReviews");
        const orderCollection = database.collection("colorCastleOrders");
        const usersCollection = database.collection("colorCastleUsers");


        //get service api
        app.get("/colorCastleServices", async (req, res) => {
            const services = await serviceCollection.find({}).toArray();
            res.send(services);
        });

        //POST API- Add service
        app.post('/colorCastleServices', async (req, res) => {
            const name = req.body.name;
            const desc = req.body.desc;
            const price = req.body.price;
            const time = req.body.time;
            const phone = req.body.phone;

            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imgBuffer = Buffer.from(encodedPic, 'base64');



            const service = {
                name,
                desc,
                price,
                time,
                phone,
                image: imgBuffer,
                image2: imgBuffer2
            };
            const result = await serviceCollection.insertOne(service);

            res.json(result);
        });

        //POST API- Add review
        app.post('/colorCastleReviews', async (req, res) => {
            const review = await reviewsCollection.insertOne(req.body);
            res.json(review);
        });

        //get review api
        app.get("/colorCastleReviews", async (req, res) => {
            const reviews = await reviewsCollection.find({}).toArray();
            res.send(reviews);
        })

        // get single service
        app.get("/colorCastleServices/:id", async (req, res) => {
            const serviceDetails = await serviceCollection.findOne({ _id: ObjectId(req.params.id) });
            res.send(serviceDetails);
        })

        //single order
        app.get("/colorCastleOrders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(query);
            res.json(result);
        })

        //Delete API - order

        app.delete("/colorCastleOrders/:id", async (req, res) => {
            const deletedOrder = await orderCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedOrder);
        });

        //post service order
        app.post('/colorCastleOrders', async (req, res) => {
            const orders = await orderCollection.insertOne(req.body);
            res.json(orders);
        });

        //get order
        app.get("/colorCastleOrders", async (req, res) => {
            const order = await orderCollection.find({}).toArray();
            res.send(order);
        });

        //UPDATE API - booking orders status property
        app.put('/colorCastleOrders/:id', async (req, res) => {
            const order = req.body;
            const options = { upsert: true };
            const updatedOrder = {
                $set: { status: order.status, payment: order }

            };
            const updateStatus = await orderCollection.updateOne({ _id: ObjectId(req.params.id) }, updatedOrder, options);

            res.json(updateStatus);
        });

        //Delete API - service

        app.delete("/colorCastleServices/:id", async (req, res) => {
            const deletedProduct = await serviceCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedProduct);
        });

        //POST API- users
        app.post('/colorCastleUsers', async (req, res) => {
            const user = await usersCollection.insertOne(req.body);
            console.log(user);
            res.json(user);
        });


        // UPDATE API - users

        app.put('/colorCastleUsers', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateUser = { $set: user }
            const result = await usersCollection.updateOne(filter, updateUser, options);
            res.json(result);

        });

        // UPDATE API- update users role 

        app.put('/colorCastleUsers/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        });

        //GET API- users

        app.get('/colorCastleUsers/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);

            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            };
            console.log(isAdmin);
            res.json({ admin: isAdmin });
        });



        console.log('database connected successfully');

    } finally {
        //await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send(' server is running');
});

app.listen(port, () => {
    console.log('server running at port', port);
});