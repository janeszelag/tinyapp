//CONSTANTS & REQUIREMENTS

const express = require('express');
const app = express();
const PORT = 8080; //default port is 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



//DATA


//URL OBJECTS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//USERS OBJECT
const users = {
  "b": {
    id: "b",
    email: "ucat.com",
    password: "dishwasher-funk"
  }
};



//HELPER FUNCTIONS

//Generates a 6 character alphanumeric string for tinyURL & id
const generateRandomString = function() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


//Searches for email in users object
const findEmail = function(obj, emailToSearch) {
  for (let key in obj) {
    for (let newKey in obj[key]) {
      if (obj[key][newKey] === emailToSearch) {
        return obj[key];
      }
    }
  }
  return false;
};



//Server is listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



//GETS

//FORM for logging in
app.get("/login", (req, res) => {
  let id = req.cookies['user_id'];
  let user = users[id];
  let templateVars = { user };
  res.render("_login", templateVars);
});

//FORM for creating new tiny URL
app.get("/urls/new", (req, res) => {
  let id = req.cookies['user_id'];
  let user = users[id];
  let templateVars = { user };
  res.render("urls_new", templateVars);
});

//FORM to register
app.get("/register", (req, res) => {
  let id = req.cookies['user_id'];
  let user = users[id];
  let templateVars = { user };
  res.render("_register", templateVars);
});


//page that DISPLAYS the long and short URL including a hyperlink
app.get("/urls/:shortURL", (req, res) => {
  let id = req.cookies['user_id'];
  let user = users[id];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user};
  res.render("urls_show", templateVars);
});

//HYPERLINK when hyperlink is clicked, redirects to actual longURL page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//INDEX - page with all of our current urls
app.get("/urls", (req, res) => {
  let id = req.cookies['user_id'];
  let user = users[id];
  let templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});

//ROOT page - just says hello
app.get('/', (req, res) => {
  res.send('Hello!');
});



//POSTS



//DELETE url from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  let value = req.params.shortURL;
  delete urlDatabase[value];
  res.redirect("/urls");
});


//UPDATE longURL
app.post('/urls/:shortURL', (req, res) => {
  let value2 = req.params.shortURL;
  urlDatabase[value2] = req.body.longURL;
  res.redirect("/urls");
});

//CREATE a new user
app.post('/register', (req, res) => {
  let idValue = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (userPassword.length === 0 || userEmail.length === 0) {
    res.status(400).send("Status Code 404: Incorrect email or password format");
  }
  let searchResult  = findEmail(users, userEmail);
  if (searchResult) {
    res.status(400).send("Status Code 404: Sorry that email is already in use");
  } else {
    users[idValue] = {id: idValue, email: userEmail, password: userPassword};
    res.cookie('user_id', idValue);
    res.redirect("/urls");
  }
});

//LOGIN
app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userObject  = findEmail(users, userEmail);
  if (userObject) {
    if (userPassword === userObject.password) {
      let id = userObject.password;
      res.cookie('user_id', id);
      res.redirect("/urls");
    } else  {
      res.status(403).send("Incorrect password");
    }
  } else {
    res.status(403).send("Sorry that email does not exist. ");
  }
});

//LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

