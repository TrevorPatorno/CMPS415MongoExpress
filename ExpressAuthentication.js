const { MongoClient } = require("mongodb");
const cookieParser = require("cookie-parser");

// connection string for mongo db
const uri = "mongodb+srv://expressAuthAccount:authenticator@cluster0.39hko4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// standard stuff to get app working on browser
const express = require("express");
const app = express();

app.listen(3000);
console.log('Server started at http://localhost:' + 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Default route: should go to Register Page
app.get('/', function(req, res) {
  // checks for cookies, if one exists, go to Login Page. if not, go to RegisterAndLogin page
  if (req.cookies.Authentication_Cookie) {
    res.redirect('/welcome.html');
  } else {
    res.sendFile(__dirname + '/RegisterAndLogin.html');
  }
});

// Route for handling registration/how it works
app.post('/register', async function(req, res) {
  // get username and password of user registering and connect to MongoDB
  const { username, password } = req.body;
  const mongoClient = new MongoClient(uri);

  // Have to insert the user data into our MongoDB
  // if successful, log it worked and redirect to login page
  // if not successful, handle in catch block
  try {
    await mongoClient.connect();

    const db = mongoClient.db('Credientials');
    const dbCollection = db.collection('CredientialInfo');
    
    await dbCollection.insertOne({ username, password });
    console.log("Successfully registered user, with username: ", username);

    res.redirect('/login.html');
  } catch (err) {
    console.error("Failed to register: ", err);
    res.status(500).send('Failed to register');
  } finally {
    await mongoClient.close;
  }
});

// Route for handling users logging in
app.post('/login', async function(req, resp) {
  // get username and password of user trying to login and connect to MongoDB
  const { username, password } = req.body;
  const mongoClient = new MongoClient(uri);

  try {
    await mongoClient.connect();

    const db = mongoClient.db('Credientials');
    const dbCollection = db.collection('CredientialInfo');

    // try to find the user with the specified username and password from MongoDB
    const user = await dbCollection.findOne({ username, password });

    // if user exists and info is correct, give the user a unique auth cookie
    // expiration date is set to 60000 ms or 1 minute, and log success to console
    if (user) {
      const newCookieVal = username + Date.now();
      res.cookie('Authentication_Cookie', newCookieVal, { maxAge: 60000 });
      console.log("Cookie created and user logged in: ", username, " with cookie : ", newCookieVal);
  
      // if user is successfully logged in, redirect them to a welcome page or dashboard
      res.sendFile(__dirname + '/Welcome.html');
    } else {
      // if user doesn't exist and info is invalid, reroute to login
      res.send('Invalid login info. <a href="/Login.html">Attempt Login Again</a>');
    }
  } catch (err) {
    console.error("Login Error: ", err);
    res.status(500).send('Login Error');
  } finally {
    await mongoClient.close();
  }
});

// Route for accessing database objects/items (including users)
app.get('/api/mongo/:item', async function(req, res) {
  const mongoClient = new MongoClient(uri);

  try {
    await mongoClient.connect();

    const db = mongoClient.db('Credientials');
    const dbCollection = db.collection('CredientialInfo');

    const queryStr = { username: req.params.item };
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

// Route to display all cookies that haven't expired
app.get('/display-cookies', function(req, res) {
  const allCookies = req.cookies;
  let cookieOutput = "";

  // iterates through all cookies and makes sure each cookie does pertain to allCookies (it should)
  // if a cookie does belong to allCookies, then the output with be appended with the cookie and its value
  for (const cookie in allCookies) {
    if (allCookies.hadOwnProperty(cookie)) {
      cookieOutput += `${cookie}: ${allCookies[cookie]} <br>`;
    }
  }
  // Linking back to welcome page so cookies can also be cleared if desired
  // Output of cookies is sent as well (since appended output)
  cookieOutput += '<br> <a href="/landingPage.html">Back to Landing Page </a>';
  res.send(cookieOutput);
});

// Route to erase all cookies
app.get('/erase-cookies', function(req, resp) {
  res.clearCookie('Authentication_Cookie');
  res.send('Erasing Cookies was successfully. ');
  res.send('<br> <a href="/"><input type="submit" value="Default Page"></input></a> <br> <a href="/display-cookies"><input type="submit" value="Display Cookies"></input></a>');
});

// Route for Registration Page
app.get('/register.html', function(req, res) {
  res.sendFile(__dirname + '/Register.html');
});

// Route for Login Page
app.get('/login.html', function(req, res) {
  res.sendFile(__dirname + '/login.html');
});

// Route for RegisterAndLogin Page
app.get('/registerAndLogin.html', function(req, res) {
  res.sendFile(__dirname + '/registerAndLogin.html');
});

// Route for Welcome Page
app.get('/welcome.html', function(req, res) {
  res.sendFile(__dirname + '/welcome.html');
});
