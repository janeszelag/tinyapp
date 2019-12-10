const express = require('express');
const app = express();
const PORT = 8080; //default port is 8080

//tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

//to translate Buffer to human readable data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//object containg all our tiny urls 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get('/', (req, res) => {
  res.send('Hello!');
});



//page with all of our current urls
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//page with form for creating new tiny URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//a page that DISPLAYS the long and short URL including a hyperlink
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
});

//CREATES a new tiny url upon input
app.post("/urls", (req, res) => {
  let result = generateRandomString();
  urlDatabase[result] = req.body.longURL;
  templateVars = { shortURL: result, longURL: urlDatabase[result]}
  res.redirect( `/urls/${result}`);
});

//DELETE url from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  let value = req.params.shortURL;
  delete urlDatabase[value];
  res.redirect("/urls");
})

//when hyperlink is clicked, redirects to actual longURL page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});





