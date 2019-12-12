//CONSTANTS & REQUIREMENTS

const express = require('express');
const app = express();
const PORT = 8080; //default port is 8080
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'Katherine',

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//DATA


//URL OBJECTS
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
      if (obj[key].email === emailToSearch) {
        return obj[key];
      }
    }
  return false;
};



//Searches for email in users object
const findUserUrls = function(id) {
  let newObj = {};
  for (let key in urlDatabase) {
      if (urlDatabase[key].userID === id) {
        newObj[key] = urlDatabase[key];
      }
    }
  return newObj;
};




//Server is listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



//GETS

//FORM for logging in
app.get('/login', (req, res) => {
  let id = req.session.user_id;
  let user = users[id];
  let templateVars = { user };
  res.render("_login", templateVars);
});


//FORM for creating new tiny URL
app.get('/urls/new', (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let user = users[id];
    let templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});


//FORM to register
app.get("/register", (req, res) => {
  let id = req.session.user_id ;
  let user = users[id];
  let templateVars = { user };
  res.render("_register", templateVars);
});


//page that DISPLAYS the long and short URL including a hyperlink [if and only if you own that shortURL]
app.get('/urls/:shortURL', (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (id) {
    let userObj = findUserUrls(id);
    for (let key in userObj) {
      if (shortURL === key) {
        let user = users[id];
        let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user};
        res.render('urls_show', templateVars);
        return;
      }
    }
    res.redirect('/login');
  } else {
    res.redirect('/login');
  }
  
});

//HYPERLINK when hyperlink is clicked, redirects to actual longURL page
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  if (urlDatabase.hasOwnProperty(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(403).send('Sorry, we can\'t seem to find what you are looking for....')
  }
});

//INDEX - page with all of our current urls
app.get('/urls', (req, res) => {
  let id = req.session.user_id;
  let urls = findUserUrls(id);
  let user = users[id];
  let templateVars = { urls, user};
  res.render('urls_index', templateVars);
});

//ROOT page - just says hello
app.get('/', (req, res) => {
  res.send('Hello!');
});



//POSTS



//DELETE url from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  let id = req.session.user_id ;
  let shortURL = req.params.shortURL;
  if (id) {
    let userObj = findUserUrls(id);
    for (let key in userObj) {
      if (shortURL === key) {
        delete urlDatabase[shortURL];
        res.redirect("/urls");
      }
    }
  }
});


//UPDATE a longURL [if the shortURL is yours]
app.post('/urls/:shortURL', (req, res) => {
  let id = req.session.user_id ;
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.longURL
  if (id) {
    let userObj = findUserUrls(id);
    for (let key in userObj) {
      if (shortURL === key) {
        let user = users[id];
        urlDatabase[shortURL].longURL = newLongURL;
        let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user};
        res.render('urls_show', templateVars);
        return;
      }
    }
    res.redirect('/login');
  } else {
    res.redirect('/login');
  }
});

//CREATE a new user
app.post('/register', (req, res) => {
  let idValue = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  if (userPassword.length === 0 || userEmail.length === 0) {
    res.status(400).send("Status Code 404: Incorrect email or password format");
  }
  let searchResult  = findEmail(users, userEmail);
  if (searchResult) {
    res.status(400).send("Status Code 404: Sorry that email is already in use");
  } else {
    users[idValue] = {id: idValue, email: userEmail, password: hashedPassword};
    req.session.user_id = idValue;
    res.redirect("/urls");
  }
});


//LOGIN
app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userObject  = findEmail(users, userEmail);
  if (userObject) {
    if (bcrypt.compareSync(userPassword, userObject.password)) {
      let id = userObject.id;
      req.session.user_id = id;
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
  req.session = null;
  res.redirect("/urls");
});

//CREAT tiny URL
app.post('/urls', (req, res) => {
  let id = req.session.user_id;
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  urlDatabase[shortURL] = { longURL, userID: id}
  res.redirect(`/urls/${shortURL}`)
});
