const templateSchema = require('../models/timesheet');
const generalTemplate = require("../data-templates/general");
const dbCon = require('../services/dbConnection');
const Utils = require('../utils/utilities');
const Enums = require('../utils/enums');

const getAll = function(req, res){
  let apiResult = JSON.parse(JSON.stringify(generalTemplate.apiResult));
  let authDb = null;
  let Schema = null;

  try {
    authDb = dbCon.getDbConnection(Enums.DB_TIMESHEET);
    Schema = authDb.model(Enums.MODEL_TIMESHEET, templateSchema);

    Schema.find({}, function(err, records) {
      if(err){
        apiResult.statusCode = 400;
        apiResult.messages.push(err);
      }else{
        apiResult.data = records;
      }

      //Nullify Objects
      authDb = null;
      Schema = null;

      Utils.processApiResponse(req, res, apiResult);
    });
  } catch (e) {
    apiResult.statusCode = 400;
    apiResult.messages.push(e.stack);
    Utils.processApiResponse(req, res, apiResult);
  }

  return null;
};

const createRecordNative = function(data, callback){
  _createRecordExtended(data, function(err, result) {
    callback(err, result);
  });

  return null;
}

const createRecord = function(req, res){
  let apiResult = JSON.parse(JSON.stringify(generalTemplate.apiResult));
  let data = {};

  try{
    //Get Data from Request
    data = req.body;

    //Validate Data Object properties
    if(!req.body.data){
      apiResult.statusCode = 400;
      apiResult.messages.push("Invalid Request Body JSON data provided");         
    }

    if(apiResult.statusCode === 422 || apiResult.statusCode === 400){
      return Utils.processApiResponse(req, res, apiResult);
    }

    _createRecordExtended(data.data, function(err, result) {
      if(err){
        apiResult.statusCode = 400;
        apiResult.messages.push(err);
      }else{
        apiResult.data = result;
      }

      Utils.processApiResponse(req, res, apiResult);
    });
  }catch(e){
    apiResult.statusCode = 400;
    apiResult.messages.push(e.stack);
    Utils.processApiResponse(req, res, apiResult);
  }

  return null;
};

//PRIVATE FUNCTIONS
const _createRecordExtended = function(data, callback){
  const dataTemplate = require("../data-templates/timesheet");  

  let authDb = null;
  let Schema = null;
  let entry = {};
  let model = {};

  try {
    authDb = dbCon.getDbConnection(Enums.DB_TIMESHEET);
    Schema = authDb.model(Enums.MODEL_TIMESHEET, templateSchema);    
    entry = JSON.parse(JSON.stringify(dataTemplate.core));
    
    entry.createdBy = data.username;
    entry.modifiedBy = data.username;
    entry.data = data;
  
    model = new Schema(entry);

    Schema.create(model, function(err, result) {
      //Nullify Objects
      authDb = null;
      Schema = null;
      model = null;

      callback(err, result);
    });

  } catch (e) {
    callback(e.stack, null);
  }

  return null;
}

exports.getAll = getAll;
exports.createRecord = createRecord;
exports.createRecordNative = createRecordNative;