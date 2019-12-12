//•••••••••••••••••••••••••••••••••••••••••CONSTANTS & REQUIREMENTS•••••••••••••••••••••••••••••••••••••••••


const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const {generateRandomString, findEmail, findUserUrls} = require('./helper_functions');


app.set('view engine', 'ejs');
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
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};



//♦︎♦︎♦︎♦︎USERS OBJECT♦︎♦︎♦︎♦︎
/////////////////////////////////////////////
const users = {
  '1ddf3g': {
    id: '1ddf3g',
    email: 'ucat.com',
    //new passwords will be hashed
    password: 'dishwasher-funk'
  }
}




//•••••••••••••••••••••••••••••••••••••••••••••••••GETS•••••••••••••••••••••••••••••••••••••••••••••••••••••



//♦︎♦︎♦︎♦︎FORM to LOGIN ♦︎♦︎♦︎♦︎
/////////////////////////////////////////////////////
app.get('/login', (req, res) => {
  let id = req.session.user_id;
  if (id) {
    res.redirect('/urls');
  } else {
    let user = '';
    let templateVars = {user, notLoggedInError: false, incorrectPasswordError: false, noEmailError: false};
    res.render('_login', templateVars);
  }
});



//♦︎♦︎♦︎♦︎FORM to REGISTER♦︎♦︎♦︎♦︎
////////////////////////////////
app.get('/register', (req, res) => {
  let id = req.session.user_id;
  if (id) {
    res.redirect('/urls');
  } else {
    let user = '';
    let templateVars = { user, incorrectPasswordError: false, emailError: false };
    res.render('_register', templateVars);
  }
});



//♦︎♦︎♦︎♦︎FORM for creating NEW shortURL♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////////
app.get('/urls/new', (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let user = users[id];
    let templateVars = { user };
    res.render('urls_new', templateVars);
  } else {
    //you cannot create a shortURL if you are not logged in
    let templateVars = {user:'', notLoggedInError: true,  incorrectPasswordError: false, noEmailError: false };
    res.render('_login', templateVars);
  }
});



//♦︎♦︎♦︎♦︎shortURL PAGE \ EDIT form \ hyperlink♦︎♦︎♦︎♦︎
///////////////////////////////////////////////
app.get('/urls/:shortURL', (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (id) {//if you are logged in
    let user = users[id];
    let urls = findUserUrls(urlDatabase, id);
    for (let URL in urls) {
      if (shortURL === URL) {
        //and you own that shortURL, urls_show page is displayed
        let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user};
        res.render('urls_show', templateVars);
        return;
      }
    }
    //if you are logged in but DO NOT own the shortURL, sent to /urls with message
    let templateVars = {urls, user, authourizationError: true};
    res.render('urls_index', templateVars);

  } else {
    //if you are NOT logged in, redirected to /login with message
    let templateVars = {user:'', notLoggedInError: true,  incorrectPasswordError: false, noEmailError: false };
    res.render('_login', templateVars);
  }
});



//♦︎♦︎♦︎♦︎HYPERLINK/shareable link that redirects to actual longURL page♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////////////////////////
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  //checks database for that shortURL, if it exists it redirects
  if (urlDatabase[shortURL]) { //anyone has access
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    //if it does not exist, sends error and html
    res.status(404).send('Status Code 404: Sorry that link does not appear to exist....');
  }
});



//♦︎♦︎♦︎♦︎INDEX page with all of the users current urls (if any)♦︎♦︎♦︎♦︎
////////////////////////////////////////////
app.get('/urls', (req, res) => {
  let id = req.session.user_id;
  //checks that you are loggen in 
  if (id) {
    //you are logged in, the shortURLs you own (if any) are retrieved 
    let urls = findUserUrls(urlDatabase, id);
    let user = users[id];
    let templateVars = { urls, user, authourizationError: false};
    res.render('urls_index', templateVars);
  } else {
    //if you are not logged in, redirects to /login with message
    let templateVars = {user:'', notLoggedInError: true,  incorrectPasswordError: false, noEmailError: false };
    res.render('_login', templateVars);
  }
});



//♦︎♦︎♦︎♦︎ROOT page♦︎♦︎♦︎♦︎
///////////////////////////////
app.get('/', (req, res) => {
  let id = req.session.user_id;
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
    let urls = findUserUrls(urlDatabase, id);
    for (let URL in urls) {
      if (shortURL === URL) {
        //if you own it, it gets deleted
        delete urlDatabase[shortURL];
        res.redirect('/urls');
        return;
      } else {
        //if you don't own you get error
        res.status(403).send('Status Code 403: Not authourized.')
        return;
      }
    }
  } else {
    //if you aren't logged in, get error
    res.status(403).send('Status Code 403: Not authourized.')
  }
});



//♦︎♦︎♦︎♦︎UPDATE a longURL [if the shortURL is yours and you are logged in]♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////////////
app.post('/urls/:shortURL', (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (id) { //if you are logged in, searches through your shortURLs
    let urls = findUserUrls(urlDatabase, id);
    let user = users[id];
    for (let URL in urls) {
      if (shortURL === URL) {
        //if you own the shortURL, the longURL is modified
        let newLongURL = req.body.longURL;
        //check that empty field wasn't submitted
        if (newLongURL.length !== 0) {
          urlDatabase[shortURL].longURL = newLongURL;
          let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user};
          res.render('urls_show', templateVars);
          return;
        } else {
          res.redirect('/urls')
        }
      }
    }
    //if you don't own that shortURL, an error is sent
    res.status(403).send('Status Code 403: Not authourized.')
  } else {
    //if you are not loggen in, an error is sent
    res.status(404).send('Status Code 403: Error.')
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
    let templateVars = { user: '', incorrectPasswordError: true, emailError: false};
    res.status(404).render('_register', templateVars );
    return;
  }
  //checks that the email is not yet used
  let searchResult  = findEmail(users, userEmail);
  if (searchResult) {//email is already in use, sends error
    let templateVars = { user: '', incorrectPasswordError: false, emailError: true};
    res.status(404).render('_register', templateVars );
    return;
  } else {
  //email is not in use, new user is added to users object with hashed password
    users[idValue] = {id: idValue, email: userEmail, password: hashedPassword};
    req.session.user_id = idValue;
    res.redirect('/urls');
  }
});



//♦︎♦︎♦︎♦︎LOGIN♦︎♦︎♦︎♦︎
//////////////////////////////////////////////////
app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (userPassword.length === 0 || userEmail.length === 0) {
    let templateVars = { user: '', notLoggedInError: false,  incorrectPasswordError: true, noEmailError: false  }
    res.status(400).render('_login', templateVars );
    return;
  }
  //searches users database for the email and if found returns that user object
  let userObject  = findEmail(users, userEmail);
  if (userObject) {
  //email has been found and bcrypt checks that the passwords match
    if (bcrypt.compareSync(userPassword, userObject.password)) {
      //if they match, cookie created & redirect to /urls
      let id = userObject.id;
      req.session.user_id = id;
      res.redirect('/urls');
      return;
    } else {
      //passwords don't match, reloads login with error
      let templateVars = { user: '', notLoggedInError: false,  incorrectPasswordError: true, noEmailError: false  }
      res.status(404).render('_login', templateVars );
      return;
    }
  } else {
    //email not found
    let templateVars = { user: '', notLoggedInError: false,  incorrectPasswordError: false, noEmailError: true }
    res.status(404).render('_login', templateVars );
  }
});



//♦︎♦︎♦︎♦︎LOGOUT♦︎♦︎♦︎♦︎
//////////////////////////////////////////
app.post('/logout', (req, res) => {
  //ends cookie session
  req.session = null;
  res.redirect('/login');
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
