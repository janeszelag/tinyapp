
//••••••••••••••••••••••••••••••••••••••••••HELPER FUNCTIONS••••••••••••••••••••••••••••••••••••••••••••••


//Generates a 6 character alphanumeric string for tinyURL & id
const generateRandomString = function() {
  let randomString           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randomString;
};


//Searches for an email in users object
const findEmail = function(database, emailToSearch) {
  for (let user in database) {
    if (database[user].email === emailToSearch) {
      return database[user];
    }
  }
  return false;
};


//Searches for urls belonging to a user
const findUserUrls = function(database, user) {
  let urlsObj = {};
  for (let URL in database) {
    if (database[URL].userID === user) {
      urlsObj[URL] = database[URL];
    }
  }
  return urlsObj;
};


module.exports = {
  generateRandomString,
  findEmail,
  findUserUrls
};