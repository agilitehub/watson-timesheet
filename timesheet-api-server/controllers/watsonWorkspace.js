const crypto = require('crypto');
const request = require('request');
const cache = require('memory-cache');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const Enums = require('../utils/enums');
const Globals = require('../utils/globals');
const Timesheet = require('./timesheet');

const execute = function(req, res){
  let isValidRequest = false;
  let msg = "";
  let spaceId = "";
  let responseTitle = "";
  let responseMessage = "";
  let wcData = {};
  let cacheContext = null;
  let actionType = "";
  let saveContext = false;
  let deleteContext = false;

  try {
    //Is Watson Workspace submitting a challenge or a user request?
    if(req.body.type === 'verification') {
      //This function will handle the HTTPresponse directly
      _challenge(req, res)
    }else{
       //Provide immediate response to WW, as the response message will be sent asynchronously
      res.status(201).end();
      
      // Double check to only handle message-created events thare not empty and not from our bot
      if(req.body.type !== 'message-created' || req.body.userId === process.env.APP_ID || req.body.content === "")
        return null;

      msg = req.body.content;
      spaceId = req.body.spaceId;
      cacheContext = cache.get(Enums.CACHE_CONTEXT + req.body.userId);

      //Next: We need to handle the message from the user and check if it's a valid request
      if(cacheContext){
        console.log("It's an ongoing conversation");
        isValidRequest = true;
      }
    
      if(!isValidRequest){
        console.log("It's a new conversation");
        //Check for Trigger Words
        if(msg.split(/[^A-Za-z0-9]+/).filter((word) => /^(waston|watson)$/i.test(word)).length){
          console.log("Trigger Words found");
          isValidRequest = true;
        }
      }

      if(isValidRequest){
        var conversation = new ConversationV1({
          headers: {"X-Watson-Learning-Opt-Out": true},          
          version_date: ConversationV1.VERSION_DATE_2017_05_26
        });

        wcData = {
          input: {text: msg},
          workspace_id: Globals.config.wcWorkspaceId,
          context:{
            username:req.body.userName
          }
        };

        if(cacheContext)
          wcData.context = cacheContext;

        console.log("Sending Message to Watson Conversation Workspace:");
        console.log(wcData);

        conversation.message(wcData, function(err, response) {
            if (err) {
              responseTitle = "Unsuccessful";
              responseMessage = "Apologies. Something went wront with the conversation service. Please wait a few minutes and try again?";
              deleteContext = true;

              console.error("WC Error Occurred");
              console.error(err);
            } else {
              console.log("--START WC RESPONSE--");
              console.log(response);
              console.log("--END WC RESPONSE--");
              
              cacheContext = response.context;
              responseMessage = response.output.text[0];     

              //Determine Response Title
              //TODO: We need to fix this. Maybe add a variable in the context called messageTitle
              if(response.intents.length > 0){
                switch(response.intents[0].intent){
                  case "greeting":
                    responseTitle = "General Conversation";
                    break;
                  default:
                    responseTitle = "New Timesheet";
                }
              }else{
                responseTitle = "New Timesheet";
              }

              //Check if context needs to be stored or deleted
              if(cacheContext.conversationComplete){
                deleteContext = true;
              }else{
                saveContext = true;
              }

              //Check what actions need to be performed
              if(cacheContext.performAction){
                actionType = cacheContext.performAction;
              }

              switch(actionType){
                case Enums.ACTION_SUBMIT_TIMESHEET:
                  cacheContext.wwUserId = req.body.userId;
                  cacheContext.username = req.body.userName;

                  //TODO: Add WW username to context, just in case it's not there
                  Timesheet.createRecordNative(cacheContext, function(err, result){
                    if(err){
                      responseTitle = "Timesheet Submission Failed";
                      responseMessage = "Apologies. Something went wrong";
                    }else{
                      responseTitle = "Success";
                      responseMessage = "Timesheet successfully submitted 👍";
                    }

                    _send(spaceId, responseTitle, responseMessage);
                  });       
                  break;
                case Enums.ACTION_CONFIRM_TIMESHEET:
                  responseTitle = "Confirm Timesheet";

                  if(!cacheContext.hoursBilled)
                    cacheContext.hoursBilled = 0;

                  responseMessage += "\n*Date:* `" + cacheContext.date + "`";
                  responseMessage += "\n*Client:* `" + cacheContext.client + "`";
                  responseMessage += "\n*Type Of Work:* `" + cacheContext.typeOfWork + "`";
                  responseMessage += "\n*Hours Spent:* `" + cacheContext.hoursSpent + "`";
                  responseMessage += "\n*Hours Billed:* `" + cacheContext.hoursBilled + "`";
                  responseMessage += "\n*Description:* `" + cacheContext.description + "`";
                  break;
              } 
            }

            //Check if Context needs to be cached
            if(saveContext){
              //TODO: Add WW username before saving
              cache.put(Enums.CACHE_CONTEXT + req.body.userId, cacheContext);
            }else if(deleteContext){
              cache.del(Enums.CACHE_CONTEXT + req.body.userId);
            }
            
            //Submit the Response to the User
            console.log("Response Title = " + responseTitle);
            console.log("Response = " + responseMessage);

            _send(spaceId, responseTitle, responseMessage);     
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

const _send = (spaceId, responseTitle, responseMessage) => {
  request.post(
    'https://api.watsonwork.ibm.com/v1/spaces/' + spaceId + '/messages', {
      headers: {Authorization: 'Bearer ' + cache.get(Enums.CACHE_OAUTH)},
      json: true,
      // An App message can specify a color, a title, markdown text and
      // an 'actor' useful to show where the message is coming from
      body: {
        type: 'appMessage',
        version: 1.0,
        annotations: [{
          type: 'generic',
          version: 1.0,
          color: '#b01724',
          title: responseTitle,
          text: responseMessage,
          actor: {
            name: 'Watson'
          }
        }]
      }
    }, (err, res) => {
      if(err || res.statusCode !== 201) {
        console.log('Error sending message to Space ' + spaceId);
        console.log(err || res.statusCode);
      }
    });

    return null;
};

exports.execute = execute;