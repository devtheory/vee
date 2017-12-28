'use strict';

class ServiceRegistry {
  constructor(){
    this._services = [];
    this._timeout = 30; //remove services that don't announce themselves after timeout
  }

  add(intent, ip, port){
    const key = intent+ip+port;
    if(!this._services[key]){ //if service doesn't exist, register it
      let obj = {intent, ip, port, timestamp: Math.floor(new Date() / 1000)};
      this._services[key] = obj;
      console.log(`Added service for intent ${intent} on ${ip}:${port}`);
      this._cleanup();
      return;
    }

    //if service exists, update timestamp
    this._services[key].timestamp = Math.floor(new Date() / 1000);
    console.log(`Updated service for intent ${intent} on ${ip}:${port}`);
    this._cleanup();
  }

  remove(intent, ip, port){
    const key = intent+ip+port;
    delete this._services[key];
  }

  get(intent){
    this._cleanup();
    for(let key in this._services){
      if(this._services[key].intent == intent){
        return this._services[key];
      }
    }
    return null;
  }

  _cleanup(){
    const now = Math.floor(new Date() / 1000);

    for(let key in this._services){
      if(this._services[key].timestamp + this._timeout < now){//expired service, remove it
        delete this._services[key];
      }
    }
  }
}

module.exports = ServiceRegistry;
