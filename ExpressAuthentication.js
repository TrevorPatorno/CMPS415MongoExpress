const { MongoClient } = require("mongodb");
const cookieParser = require("cookie-parser");

// connection string for mongo db
const uri = "mongodb+srv://expressAuthAccount:authenticator@cluster0.39hko4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// standard stuff to get app working on browser
const express = require("express");
const app = express();

app.listen(3000);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Default route: should go to Register Page
app.get('/', function(req, res) {
  res.sendFile(__placeholder + '/register.html');
});

// Route for handling registration/how it works
app.post('/register', async function(req, res) {
  // get id and password of user registering and connect to MongoDB
  const { id, password } = req.body;
  const mongoClient = new MongoClient(uri);

  // Have to insert the user data into our MongoDB
  // if successful, log it worked and redirect to login page
  // if not successful, handle in catch block
  try {
    await mongoClient.connect();

    const db = mongoClient.db('Credientials');
    const dbCollection = db.collection('CredientialInfo');
    
    await dbCollection.insertOne({ id, password });
    console.log("Successfully registered user, with id: ", id);

    res.redirect('/login.html');
  } catch (err) {
    console.error("Failed to register: ", err);
    res.status(500).send('Failed to register');
  } finally {
    await mongoClient.close;
  }
});

// Route for Login Page
app.get('/login.html', function(req, res) {
  res.sendFile(__placeholder + '/login.html');
});

// Route for accessing database objects/items (including users)
app.get('/api/mongo/:item', async function(req, res) {
  const mongoClient = new MongoClient(uri);

  try {
    await mongoClient.connect();

    const db = mongoClient.db('Credientials');
    const dbCollection = db.collection('CredientialInfo');

    const queryStr = { id: req.params.item };
    const user = await dbCollection.findOne(queryStr);

    if (user) {
      res.send('Query Results: ' + JSON.stringify(user));
    } else {
      res.send('Failed to find database object');
    }
  } catch (err) {
    console.error("Failed to access database: ", err);
    res.status(500).send('Failed to access database');
  } finally {
    await mongoClient.close();
  }
});
