const request = require('request');
const jsonwebtoken = require('jsonwebtoken');
const cache = require('memory-cache');
const Enums = require('./utils/enums');

const run = () => {  
  request.post('https://api.watsonwork.ibm.com/oauth/token', {
    auth: {user: process.env.APP_ID, pass: process.env.APP_SECRET},
    json: true,
    form: {grant_type: 'client_credentials'}
  }, (err, res) => {
    if(err || res.statusCode !== 200) {
      console.log("Error getting token");
    }else{
      cache.put(Enums.CACHE_OAUTH, res.body.access_token);
      console.log("Got new token");
    }
  });
};

exports.run = run;