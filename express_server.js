//CONSTANTS & REQUIREMENTS

const express = require('express');
const app = express();
const PORT = 8080; //default port is 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())



//DATA


//object containg all our tiny urls 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//object containing users including an example for format info, 
const users = { 
  "b": {
    id: "b", 
    email: "ucat.com", 
    password: "dishwasher-funk"
  }
};



//HELPER FUNCTIONS

//function to generate 6 character alphanumeric string for tinyURL
function generateRandomString() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( let i = 0; i < 6; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//function to search for email in users object

const findEmail = function(obj, emailToSearch, callback) {
  for (let key in obj) {
    for (let newKey in obj[key]) {
      if (obj[key][newKey] === emailToSearch) {
        callback()
      }
    }
  }
}



//server is listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



//GETS


//page with form for creating new tiny URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new", users);
});

//form to register
app.get("/register", (req, res) => {
  res.render("_register", users);
});


//page that DISPLAYS the long and short URL including a hyperlink
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], users};
  res.render("urls_show", templateVars)
});

//when hyperlink is clicked, redirects to actual longURL page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//page with all of our current urls
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, users};
  res.render("urls_index", templateVars);
});

//root page - just says hello
app.get('/', (req, res) => {
  res.send('Hello!');
});



//POSTS



//DELETE url from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  let value = req.params.shortURL;
  delete urlDatabase[value];
  res.redirect("/urls");
})


//POST to update longURL
app.post('/urls/:shortURL', (req, res) => {
  let value2 = req.params.shortURL;
  urlDatabase[value2] = req.body.longURL;
  res.redirect("/urls");
})

//creates a new user
app.post('/register', (req, res) => {
  let idValue = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (userPassword.length === 0 || userEmail.length === 0) {
    res.status(400).send("Status Code 404: Incorrect email or password format")
  };
  findEmail(users, userEmail, function() {
    res.status(400).send("Status Code 404: Sorry that email is already in use")
  })
  users[idValue] = {id: idValue, email: userEmail, password: userPassword}
  res.cookie('user_id', idValue);
  res.redirect("/urls");
})

//logs user in 
app.post('/login', (req, res) => {
  let value = req.body.username;
  res.cookie('username', value);
  console.log(value);
  res.redirect("/urls");
})

//logs user out 
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

