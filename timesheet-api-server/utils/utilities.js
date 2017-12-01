const Enums = require('./enums');
const Globals = require('./globals');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');

const processApiResponse = function(req, res, apiResult){
  let result = {
    success:apiResult.statusCode === 200 ? true : false,
    messages:apiResult.messages,
    data:apiResult.data
  };

  res.set('Content-Type', apiResult.contentType);
  res.status(apiResult.statusCode).send(result);

  return null;
};

const loadConfig = function(callback){
  let deployType = "";
  let result = "";
  let filePath = "";

  try {
    //Check if Deploy Type can be resolved for Bluemix
    deployType = process.env.DEPLOY_TYPE;

    if(!deployType){
      //Try Local
      require('dotenv').config()
      deployType = process.env.DEPLOY_TYPE;

      //Default deployType to Local if still not defined
      if(!deployType){
        deployType = Enums.DEPLOY_TYPE_LOCAL;
      }
    }

    //If we get here, Get Config Details
    filePath = path.join(__dirname, "../config_" + deployType + ".js");

    fs.readFile(filePath, 'utf8', function (err,data) {
      if (err) {
        console.log("Config File Not Found");
        callback(false);
      }

      try {
        result = JSON.parse(data);
        Globals.config = result;
      } catch (e) {
        console.log("Parsing Config as JSON Failed");
        callback(false);
      }

      callback(true);
    });
  } catch (e) {
    callback(false);
  }

  return null;
};


//PRIVATE FUNCTIONS
exports.processApiResponse = processApiResponse;
exports.loadConfig = loadConfig;