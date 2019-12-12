
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
const findEmail = function(database, emailToSearch) {
  for (let user in database) {
    if (database[user].email === emailToSearch) {
      return database[user];
    }
  }
  return false;
};


//Searches for email in users object
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