const Enums = require('../utils/enums');
const Timesheet = require('./timesheet');
const crypto = require('crypto');
const request = require('request');
const cache = require('memory-cache');

const execute = function(req, res){
  try {
    console.log("--START WW BODY--");
    console.log(req.body);
    console.log("--END WW BODY--");

    //We need to determine what kind of request was made by Watson Workspace. It could be a challenge. We also need to verify the signature
    if(req.body.type === 'verification') {
      console.log("It's a Challenge Request");
      //This function will handle the response directly
      _challenge(req, res)
    }else{
      // Respond to the Webhook right away, as the response message will
      // be sent asynchronously
      res.status(201).end();

      // Only handle message-created Webhook events, and ignore the app's
      // own messages
      if(req.body.type !== 'message-created' || req.body.userId === process.env.APP_ID){
        return null;
      }

      // React to 'message' or 'hey' keywords in the message and send an echo
      // message back to the conversation in the originating space
      if(req.body.content.split(/[^A-Za-z0-9]+/).filter((word) => /^(hello|hey)$/i.test(word)).length){
        // Send the echo message
        _send(req.body.spaceId,
          "Hey " + req.body.userName + ". Happy Friday. Are you innovating tonight?",
          (err, res) => {
            if(!err)
              console.log('Sent message to space ' + req.body.spaceId);
          });
      }
    }
  } catch (e) {
    console.log(e.stack);
  }

  return null;
};

//PRIVATE FUNCTIONS
const _challenge = (req, res) => {
  const body = JSON.stringify({response: req.body.challenge});
  res.set('X-OUTBOUND-TOKEN', crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(body).digest('hex'));
  res.type('json').send(body);
  return null;
};

const _send = (spaceId, text, cb) => {
  console.log("Space ID = " + spaceId);
  console.log("Text = " + text);
  console.log("Token = " + cache.get('authToken'));
  request.post(
    'https://api.watsonwork.ibm.com/v1/spaces/' + spaceId + '/messages', {
      headers: {Authorization: 'Bearer ' + cache.get('authToken')},
      json: true,
      // An App message can specify a color, a title, markdown text and
      // an 'actor' useful to show where the message is coming from
      body: {
        type: 'appMessage',
        version: 1.0,
        annotations: [{
          type: 'generic',
          version: 1.0,
          color: '#6CB7FB',
          title: 'General Chat',
          text: text,
          actor: {
            name: 'Agilit-e Timesheet'
          }
        }]
      }
    }, (err, res) => {
      if(err || res.statusCode !== 201) {
        console.log('Error sending message');
        console.log(err || res.statusCode);
        cb(err || new Error(res.statusCode));
        return;
      }
      console.log('Send result ' + res.statusCode + ', ' + res.body);
      cb(null, res.body);
    });
};

exports.execute = execute;