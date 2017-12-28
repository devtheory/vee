'use strict';

const request = require('superagent');

module.exports.process = function process(intentData, registry, callback){
  let intentType = intentData.intent[0].value;
  if(intentType != 'weather'){
    return callback(new Error(`Expected time intent, got ${intentType}`))
  }

  if(!intentData.location) return callback(new Error('Missing location in weather intent'));

  const location = intentData.location[0].value;
  const service = registry.get('weather');

  if(!service) return callback(false, 'No service available');

  request.get(`http://${service.ip}:${service.port}/service/${location}`, (err, res) => {
    if(err || res.statusCode != 200 || !res.body.result){
      console.log(err);
      return callback(false, `Could not find out the weather in ${location}`);
    }

    return callback(false, res.body.result);
  });
}
