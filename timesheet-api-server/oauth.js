// Regularly obtain a fresh OAuth token for the app
const request = require('request');
const jsonwebtoken = require('jsonwebtoken');
const cache = require('memory-cache');

// Obtain an OAuth token for the app, repeat at regular intervals before the
// token expires. Returns a function that will always return a current
// valid token.
const run = () => {  
  console.log('Getting token');

  request.post('https://api.watsonwork.ibm.com/oauth/token', {
    auth: {
      user: process.env.APP_ID,
      pass: process.env.APP_SECRET
    },
    json: true,
    form: {
      grant_type: 'client_credentials'
    }
  }, (err, res) => {
    if(err || res.statusCode !== 200) {
      console.log("Error getting token");
      cb(err || new Error(res.statusCode));
      return;
    }

    // Save the fresh token
    cache.put('authToken', res.body.access_token);
    console.log("Got new token");
  });
};

exports.run = run;