var constants = {
  DB_TIMESHEET: "watsonTimesheet",
  MODEL_TIMESHEET: "timesheet",
  DEPLOY_TYPE_LOCAL:"local",
  DEPLOY_TYPE_BLUEMIX:"bluemix",
  TEMPLATE_API_RESULT:"apiResult",
  FREQUENCY_OAUTH:1800000,//30 Minutes
  CACHE_OAUTH:"authToken",
  CACHE_TIMEOUT:300000,//5 Minutes
  ACTION_SUBMIT_TIMESHEET:"timesheet_action_submit",
  ACTION_CONFIRM_TIMESHEET:"timesheet_action_confirm"
};

module.exports = constants;
