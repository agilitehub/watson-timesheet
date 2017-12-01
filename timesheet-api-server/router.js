const Timesheet = require('./controllers/timesheet');
const WW = require('./controllers/watsonWorkspace');

module.exports = function(app){
  //Timeshet
  app.get('/timesheet/data', function(req, res, next){
    Timesheet.getAll(req, res)
  });

  app.post('/timesheet/data', function(req, res, next){
    Timesheet.createRecord(req, res);
  });

  //Watson Workspace
  app.post('/ww/execute', function(req, res, next){
    WW.execute(req, res)
  });  
}