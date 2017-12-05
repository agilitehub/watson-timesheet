var apiResultTemplate = {
    success:true,
    statusCode:200,
    title:"",
    messages:[],
    data:{}
};

var getObjectTemplate = function(templateType){
  const Enums = require('./enums');
  var result = {};

  switch (templateType) {
    case Enums.TEMPLATE_API_RESULT:
      result = apiResultTemplate;
      break;
    default:

  }

  return JSON.parse(JSON.stringify(result));
}

var globals = {
  configLoaded:false,
  config:{},
  getObjectTemplate:getObjectTemplate
};

module.exports = globals;
