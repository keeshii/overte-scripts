import { createServer } from 'http';
import { parse } from 'url';
import { AppWebSocket } from './app-websocket';

export class AppServer {
  constructor() {
    this.httpServer = createServer();
    this.editorServer = new AppWebSocket();
    this.boardServer = new AppWebSocket();
  }

  setEditorActionCallback(callback) {
    this.editorServer.setActionCallback(callback);
  }

  setBoardActionCallback(callback) {
    this.boardServer.setActionCallback(callback);
  }

  init() {
    const editorServer = this.editorServer;
    const boardServer = this.boardServer;

    editorServer.init();
    boardServer.init();

    this.httpServer.on('upgrade', function (request, socket, head) {
      const { pathname } = parse(request.url);

      if (pathname === '/editor') {
        editorServer.server.handleUpgrade(request, socket, head, function(ws) {
          editorServer.server.emit('connection', ws, request);
        });
      } else if (pathname === '/board') {
        boardServer.server.handleUpgrade(request, socket, head, function(ws) {
          boardServer.server.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }

  listen(port) {
    this.httpServer.listen(port);
  }
}
