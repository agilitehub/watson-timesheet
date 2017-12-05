const Globals = require('./utils/globals');
const Utils = require('./utils/utilities');

//First Load Config Details
Utils.loadConfig(function(success){
  Globals.configLoaded = success;
  console.log("Config Loaded = " + Globals.configLoaded);

  if(success)
    launchApp();
});

const launchApp = function(){
  const helmet = require('helmet');
  const http = require('http');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const cache = require('memory-cache');  
  const express = require('express');
  const timers = require('timers');
  const router = require('./router');
  const Enums = require('./utils/enums');
  const OAuth = require('./oauth');  
  const app = express();
  const port = process.env.PORT || 6055;
  let server = null;

  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json());
  
  router(app);
  server = http.createServer(app);

  server.listen(port, function() {
      console.log("Agilit-e Timesheet API Server listening on: ", port);
      
      //Generate OAuth Token immediately and then every x minutes
      timers.setInterval(OAuth.run, Enums.FREQUENCY_OAUTH);
      OAuth.run();

      //Clear all Memory Caches
      cache.clear();
  }); 
}