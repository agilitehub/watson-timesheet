const Timesheet = require('./controllers/timesheet');

module.exports = function(app){
  //Timeshet
  app.get('/timesheet/data', function(req, res, next){
    Timesheet.getAll(req, res)
  });

  app.post('/timesheet/data', function(req, res, next){
    Timesheet.createRecord(req, res);
  });
}