'use strict';

//environment variables
require('dotenv').config();
const slackToken = process.env.SLACK_BOT_API_TOKEN;
const witToken = process.env.WIT_API_TOKEN;

const service = require('../server/service');
const http = require('http');
const server = http.createServer(service);

//clients
const slackClient = require('../server/slackClient');
const witClient = require('../server/witClient')(witToken);

const serviceRegistry = service.get('serviceRegistry');

const slackLogLevel = 'verbose';
const rtm = slackClient.init(slackToken, slackLogLevel, witClient, serviceRegistry);
rtm.start();

slackClient.addAuthenticatedHandler(rtm, () => {
  server.listen(3000);
})

server.on('listening', () => {
  console.log(`Vee is listening on ${server.address().port} in ${service.get('env')}`);
})
