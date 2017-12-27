'use strict';

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let rtm = null;
let nlp = null;

function handleOnAuthenticated(rtmStartData){
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name},
     but not yet connected to a channel`);
}

function handleOnMessage(message){
  if(message.text.toLowerCase().includes('vee')){
    nlp.ask(message.text, (err, res) => {
      const intentType = res.intent && res.intent[0];
      console.log(`intentType is ${intentType.value}`)
      if(err){
        console.log(err);
        return;
      }

      try {
        if(!res.intent || !intentType || !intentType.value){
          throw new Error('Could not extract intent');
        }
        const intent = require(`./intents/${intentType.value}Intent`);

        intent.process(res, (error, response) => {
          if(error){
            console.log(error.message);
            return;
          }

          return rtm.sendMessage(response, message.channel);
        })
      }catch(err){
        console.log(err);
        console.log(res);
        rtm.sendMessage("Sorry, I don't know what you mean", message.channel);
      }

      if(!res.intent){
        return rtm.sendMessage("Sorry, I don't understand", message.channel);
      } else if(intentType.value == 'time' && res.location){
        return rtm.sendMessage(`I don't yet know the time in ${res.location[0].value}`,message.channel);
      } else {
        console.log(res);
        return rtm.sendMessage("Sorry, I don't understand", message.channel);
      }
    })
  };
}
function addAuthenticatedHandler(rtm, handler){
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}

module.exports.init = function slackClient(token, logLevel, nlpClient){
  rtm = new RtmClient(token, {logLevel: logLevel});
  nlp = nlpClient;
  addAuthenticatedHandler(rtm, handleOnAuthenticated);
  rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
  return rtm;
}
module.exports.addAuthenticatedHandler = addAuthenticatedHandler;
