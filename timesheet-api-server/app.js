const express = require('express');
const helmet = require('helmet');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const Globals = require('./utils/globals');
const Utils = require('./utils/utilities');
const app = express();

app.use(helmet());
app.use(cors());

//First Load Config Details
Utils.loadConfig(function(success){
  Globals.configLoaded = success;
  console.log("Config Loaded = " + Globals.configLoaded);
  app.use(bodyParser.json());
  const router = require('./router');
  router(app);
});

//Server Setup
const port = process.env.PORT || 6055;
const server = http.createServer(app);

server.listen(port, function() {
    console.log("Agilit-e Timesheet API Server listening on: ", port);
});
