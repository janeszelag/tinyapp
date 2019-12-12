//•••••••••••••••••••••••••••••••••••••••••CONSTANTS & REQUIREMENTS•••••••••••••••••••••••••••••••••••••••••


const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'Katherine',
  // Cookie Options
  maxAge: 5 * 60 * 1000 // 5 minutes
}));



//♦︎♦︎♦︎♦︎Server is listening♦︎♦︎♦︎♦︎
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



//••••••••••••••••••••••••••••••••••••••••••••••••••DATA•••••••••••••••••••••••••••••••••••••••••••••••••••



//♦︎♦︎♦︎♦︎URL OBJECT♦︎♦︎♦︎♦︎
/////////////////////////////////////////////////
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};



//♦︎♦︎♦︎♦︎USERS OBJECT♦︎♦︎♦︎♦︎
/////////////////////////////////////////////
const users = {
  "1ddf3g": {
    id: "1ddf3g",
    email: "ucat.com",
    //new passwords will be hashed
    password: "dishwasher-funk"
  }
};



//••••••••••••••••••••••••••••••••••••••••••HELPER FUNCTIONS••••••••••••••••••••••••••••••••••••••••••••••

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



//•••••••••••••••••••••••••••••••••••••••••••••••••GETS•••••••••••••••••••••••••••••••••••••••••••••••••••••



//♦︎♦︎♦︎♦︎FORM for logging in♦︎♦︎♦︎♦︎
/////////////////////////////////////////////////////
app.get('/login', (req, res) => {
  let id = req.session.user_id;
  let user = users[id];
  let templateVars = {user, notLoggedInError: false};
  res.render("_login", templateVars);
});



//♦︎♦︎♦︎♦︎FORM to register♦︎♦︎♦︎♦︎
////////////////////////////////
app.get("/register", (req, res) => {
  let id = req.session.user_id;
  let user = users[id];
  let templateVars = { user };
  res.render("_register", templateVars);
});



//♦︎♦︎♦︎♦︎FORM for creating new tiny URL♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////////
app.get('/urls/new', (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let user = users[id];
    let templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    //you cannot create a shortURL if you are not logged in
    let templateVars = {user:'', notLoggedInError: true };
    res.render('_login', templateVars);
  }
});



//♦︎♦︎♦︎♦︎shortURL PAGE \ longURL EDIT form \ hyperlink♦︎♦︎♦︎♦︎
///////////////////////////////////////////////
app.get('/urls/:shortURL', (req, res) => {
  let id = req.session.user_id;
  let urls = findUserUrls(id);
  let shortURL = req.params.shortURL;
  //checks if you are logged in & have access
  if (id) {
    let user = users[id];
    let userObj = findUserUrls(id);
    for (let key in userObj) {
      if (shortURL === key) {
        let user = users[id];
        let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user};
        res.render('urls_show', templateVars);
        return;
      }
    }
    //if you don't own the shortURL, sent to /urls with message
    let templateVars = {urls, user, authourizationError: true};
    res.render('urls_index', templateVars);

  } else {
    //if you are not logged in, sent to /login with message
    let templateVars = {user:'', notLoggedInError: true };
    res.render('_login', templateVars);
  }  
});



//♦︎♦︎♦︎♦︎LINK when clicked, redirects to actual longURL page♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////////////////////////
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  //checks database for that shortURL, if it exists it redirects
  if (urlDatabase.hasOwnProperty(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    //sends error and message
    res.status(404).send('Sorry that link does not appear to exist....')
  }
}); 



//♦︎♦︎♦︎♦︎INDEX page with all of the users current urls (if any)♦︎♦︎♦︎♦︎
////////////////////////////////////////////
app.get('/urls', (req, res) => {
  let id = req.session.user_id;
  let urls = findUserUrls(id);
  let user = users[id];
  let templateVars = { urls, user, authourizationError: false};
  res.render('urls_index', templateVars);
});



//♦︎♦︎♦︎♦︎ROOT page♦︎♦︎♦︎♦︎
///////////////////////////////
app.get('/', (req, res) => {
  let id = req.session.user_id;
  console.log(id)
  if (id) {
    //if you are logged in, it sends you to /urls
    res.redirect('/urls');
  } else {
    //othwerise to login page
    res.redirect('/login');
  }
});






//••••••••••••••••••••••••••••••••••••••••••••••POSTS••••••••••••••••••••••••••••••••••••••••••••••••



//♦︎♦︎♦︎♦︎DELETES shortURL from urlDatabase♦︎♦︎♦︎♦︎
////////////////////////////////////////////////////////
app.post('/urls/:shortURL/delete', (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  //checks if you own the shortURL before it is deleted 
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



//♦︎♦︎♦︎♦︎UPDATE a longURL [if the shortURL is yours and you are logged in]♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////////////
app.post('/urls/:shortURL', (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.longURL;
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
    //error because you do not own that URL
    res.status(404).send('Authorization failed');
  } else {
    //error because you are not logged in
    res.status(404).send('Authorization failed: please login');
  }
});



//♦︎♦︎♦︎♦︎CREATES a new user♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////////////////////
app.post('/register', (req, res) => {
  //generates a string to be used as a user ID
  let idValue = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  //checks that email & password are not emppty
  if (userPassword.length === 0 || userEmail.length === 0) {
    res.status(400).send("Status Code 404: Incorrect email or password format");
  }
  //checks that the email is not yet used
  let searchResult  = findEmail(users, userEmail);
  //email found, send error
  if (searchResult) {
    res.status(400).send("Status Code 404: Sorry that email is already in use");
  } else {
  //otherwise adds new user into users object with hashed password
    users[idValue] = {id: idValue, email: userEmail, password: hashedPassword};
    req.session.user_id = idValue;
    res.redirect("/urls");
  }
});



//♦︎♦︎♦︎♦︎LOGIN♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////
app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  //searches users database for the email and if found returns that user object 
  let userObject  = findEmail(users, userEmail);
  if (userObject) {
  //bcrypt checks that the passwords match
    if (bcrypt.compareSync(userPassword, userObject.password)) {
      //if they match, cookie created & redirect to /urls
      let id = userObject.id;
      req.session.user_id = id;
      res.redirect("/urls");
    } else  {
      //passwords don't match, sends error
      res.status(403).send("Incorrect password");
    }
  } else {
    //email not found
    res.status(403).send("Sorry that email does not exist. ");
  }
});



//♦︎♦︎♦︎♦︎LOGOUT♦︎♦︎♦︎♦︎
//////////////////////////////////////////
app.post('/logout', (req, res) => {
  //ends cookie session
  req.session = null;
  res.redirect("/urls");
});




//♦︎♦︎♦︎♦︎CREATES tiny URL♦︎♦︎♦︎♦︎
/////////////////////////////////////////////////////
app.post('/urls', (req, res) => {
  let id = req.session.user_id;
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: id};
  res.redirect(`/urls/${shortURL}`);
});
