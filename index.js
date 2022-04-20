const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

//user : dbuser1
//password: rK1eFk39gDm6ccqJ

const uri = `mongodb+srv://dbuser1:rK1eFk39gDm6ccqJ@cluster0.lfvk2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("geniusCar").collection("service");
    const orderCollection = client.db("geniusCar").collection("order");

    const auth = (req, res, next) => {
      const token = req.headers["authorization"];

      if (token == null) {
        res.send("Access Denied");
      }

      jwt.verify(token, "secret", (error, user) => {
        if (error) {
          return res.send("Access Denied");
        }

        req.user = user;

        next();
      });
    };

    app.post("/login", (req, res) => {
      const email = req.body.email;

      console.log(req.body.email);
      const user = { email };

      const accessToken = jwt.sign(user, "secret");
      console.log(accessToken);

      res.send({ accessToken });
    });

    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // POST
    app.post("/service", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });

    // DELETE
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    //Place order
    app.post("/order", async (req, res) => {
      try {
        const newOrder = req.body;
        const result = await orderCollection.insertOne(newOrder);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/get-orders", auth, async (req, res) => {
      try {
        console.log(req.user);
        const query = { email: req.user.email };
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      } catch (error) {
        console.log(error);
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Genius Server");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
