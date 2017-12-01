const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  createdBy:String,
  modifiedBy:String,
  data:{
    date:Date,
    client:String,
    typeOfWork:{type:String,trim:true},
    hoursSpent:{type:Number,trim:true},
    isBillable:Boolean,
    description:String
  }
}, {timestamps:true});

module.exports = adminSchema;
