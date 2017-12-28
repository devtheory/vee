'use strict';

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let rtm = null;
let nlp = null;
let registry = null;

function handleOnAuthenticated(rtmStartData){
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name},
     but not yet connected to a channel`);
}

function handleOnMessage(message){
  if(message.text.toLowerCase().includes('vee')){
    nlp.ask(message.text, (err, res) => {
      const intentType = res.intent && res.intent[0];

      if(err){
        console.log(err);
        return;
      }

      try {
        if(!res.intent || !intentType || !intentType.value){
          throw new Error('Could not extract intent');
        }
        const intent = require(`./intents/${intentType.value}Intent`);

        intent.process(res, registry, (error, response) => {
          if(error){
            rtm.sendMessage(error.message, message.channel);
            return;
          }

          return rtm.sendMessage(response, message.channel);
        })
      }catch(err){
        rtm.sendMessage(`Sorry, I don't know what you mean.` , message.channel);
      }
    })
  };
}
function addAuthenticatedHandler(rtm, handler){
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}

module.exports.init = function slackClient(token, logLevel, nlpClient, serviceRegistry){
  rtm = new RtmClient(token, {logLevel: logLevel});
  nlp = nlpClient;
  registry = serviceRegistry;
  addAuthenticatedHandler(rtm, handleOnAuthenticated);
  rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
  return rtm;
}
module.exports.addAuthenticatedHandler = addAuthenticatedHandler;
