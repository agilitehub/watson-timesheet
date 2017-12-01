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

const createRecord = function(req, res){
  const dataTemplate = require("../data-templates/timesheet");

  let apiResult = JSON.parse(JSON.stringify(generalTemplate.apiResult));
  let authDb = null;
  let Schema = null;
  let data = {};
  let entry = {};
  let model = {};
  let customObject = null;

  try{
    authDb = dbCon.getDbConnection(Enums.DB_TIMESHEET);
    Schema = authDb.model(Enums.MODEL_TIMESHEET, templateSchema);

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

    entry = JSON.parse(JSON.stringify(dataTemplate.core));

    entry.createdBy = data.data.user;
    entry.modifiedBy = data.data.user;
    entry.data = data.data;

    model = new Schema(entry);

    Schema.create(model, function(err, record) {
      if(err){
        apiResult.statusCode = 400;
        apiResult.messages.push(err);
      }else{
        entry = record;
        apiResult.data = entry;
      }

      //Nullify Objects
      authDb = null;
      Schema = null;
      model = null;

      Utils.processApiResponse(req, res, apiResult);
    });
  }catch(e){
    apiResult.statusCode = 400;
    apiResult.messages.push(e.stack);
    Utils.processApiResponse(req, res, apiResult);
  }

  return null;
};

exports.getAll = getAll;
exports.createRecord = createRecord;