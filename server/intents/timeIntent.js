'use strict';

module.exports.process = function process(intentData, callback){
  let intentType = intentData.intent[0].value
  if(intentType != 'time'){
    return callback(new Error(`Expected time intent, got ${intentType}`))
  }

  if(!intentData.location) return callback(new Error('Missing location in time intent'));

  return callback(false, `I don't know how to process ${intentData.location[0].value}`)
}
