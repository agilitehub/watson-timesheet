var mongoose = require('mongoose');
var connections = {};
const Globals = require('../utils/globals');

exports.getDbConnection = function(dbName) {
    var url = Globals.config[Globals.config.dbType].url;

    if(dbName === Globals.config[Globals.config.dbType].authDbConnection){
      url += Globals.config[Globals.config.dbType].authDbName;
    }else{
      url += "/" + dbName;
    }

    if(Globals.config[Globals.config.dbType].urlSuffix !== ""){
      url += Globals.config[Globals.config.dbType].urlSuffix;
    }

    if(connections[dbName]) {
        return connections[dbName];
    } else {
        connections[dbName] = mongoose.createConnection(url);
        return connections[dbName];
    }
}