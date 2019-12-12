const { assert } = require('chai');

const { findEmail, findUserUrls } = require('../helper_functions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};


describe('findEmail', function() {
  it('should return a user with valid email', function() {
    const user = findEmail(testUsers, "user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput)
  });


  it('should return false if the user does not exist', function() {
    const user = findEmail(testUsers, "user3@example.com")
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});


describe('findUserUrls', function() {
  it('should return an object with all of the users URLs', function() {
    const urls = findUserUrls(urlDatabase, "user2RandomID");
    const expectedOutput = {i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID"}}
    assert.deepEqual(urls, expectedOutput);
  });

  it('should return an empty object if the user does not exist or has not made any shortURLs', function() {
    const urls = findUserUrls(urlDatabase, "user4RandomID");
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});