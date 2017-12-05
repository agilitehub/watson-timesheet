const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timesheetSchema = new Schema({
  createdBy:String,
  modifiedBy:String,
  data:{
    date:Date,
    client:String,
    typeOfWork:{type:String,trim:true},
    hoursSpent:{type:Number,trim:true},
    hoursBilled:{type:Number,trim:true},
    description:String,
    wwUserId:String
  }
}, {timestamps:true});

module.exports = timesheetSchema;