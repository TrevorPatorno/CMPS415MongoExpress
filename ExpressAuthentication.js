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
