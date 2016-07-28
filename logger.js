'use strict';

var logger;
if ( process.env.LOGGLY_TOKEN ){
  logger = require('winston');
  require('winston-loggly-bulk');
  logger.add(winston.transports.Loggly, {
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ["Winston-NodeJS"],
    json: true
  });
}else{
  logger = {
    log   : function(type,msg){ console.log(type+"\t: "+msg); },
    error : function(msg){ console.log("E\t: "+msg); }
  }
}

process.on('uncaughtException', function(err) {
  logger.error("Unexpected error: "+err)
  logger.log("Stack trace dumped to console");
  console.trace(err);
  process.exit(1);
})

logger.log('info',"Logger Initialised");

module.exports = logger;
