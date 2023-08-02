import { createServer } from 'http';
import { WebSocketServer } from 'ws';

export class AppWebSocket {

  constructor() {
    this.server = new WebSocketServer({ noServer: true });
    this.onActionCallback = function () {};
  }

  setActionCallback(onActionCallback) {
    this.onActionCallback = onActionCallback;
  }

  sendToAll(data) {
    this.server.clients.forEach(c => {
      c.send(JSON.stringify(data));
    });
  }

  init() {
    const self = this;

    const onConnection = function(ws) {
      ws.on('message', function (eventData) {
        let action;
        try {
          action = JSON.parse(eventData);
        } catch (err) {
          // ignore
        }
        if (action !== undefined) {
          const sender = {
            send: data => ws.send(JSON.stringify(data)),
            sendAll: data => self.sendToAll(data)
          };
          self.onActionCallback(sender, action);
        }
      });
    };

    this.server.on('connection', onConnection);
  }

}
