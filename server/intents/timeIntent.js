'use strict';

const request = require('superagent');

module.exports.process = function process(intentData, callback){
  let intentType = intentData.intent[0].value;
  if(intentType != 'time'){
    return callback(new Error(`Expected time intent, got ${intentType}`))
  }

  if(!intentData.location) return callback(new Error('Missing location in time intent'));

  const location = intentData.location[0].value;

  request.get(`http://localhost:4000/service/${location}`, (err, res) => {
    if(err || res.statusCode != 200 || !res.body.result){
      console.log(err);
      console.log(res.body);
      return callback(false, `Could not find out the time in ${location}`);
    }

    return callback(false, `It is now ${res.body.result} in ${location}`);
  });
}
