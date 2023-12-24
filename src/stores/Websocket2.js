import Sockette from 'sockette';

class Websocket2 {
  constructor(namespace) {
    this.connected = false;
    this.namespace = namespace
    this.ws = new Sockette(`${process.env.REACT_APP_WS2}/${this.namespace}`, {
            timeout: 5e3,
            maxAttempts: 10,
            onopen: e => {
              this.connected = true
              if (this.topics) {
                this.waitForConnection(
                    () => {
                      try {
                        this.topics.forEach((t) => {
                          this._send({ topic: t, namespace: this.namespace, type: 'SUBSCRIBE' });
                        });
                      } catch (error) {
                        console.log('error', error);
                      }
                    },
                    1000,
                    e.target,
                  );
              }
            },
            onmessage: (e) => this.handleMessage(this, e),
            onreconnect: e => console.log('Reconnecting...', e),
            onmaximum: e => console.log('Stop Attempting!', e),
            onclose: e => {this.connected = false},
            onerror: e => console.log('Error:', e)
        });
        this.handlers = {}
        this.topics = []
    this.handlers = {};
    this.topics = [];
  }

  waitForConnection(callback, interval, target) {
    if (target && target.readyState === 1) {
      callback();
    } else {
      setTimeout(() => {
        this.waitForConnection(callback, interval);
      }, interval);
    }
  }

  handleMessage(that, e) {
    const result = JSON.parse(e.data);
    
    Object.values(that.handlers).forEach(handlers => {
      handlers.forEach(handler => handler(result))
    });
  }

  _send(msg) {
    if (!this.connected) return;
    this.ws.send(JSON.stringify(msg));
  }

  subscribe(topic, handler) {
    this._send({ topic, namespace: this.namespace, type: 'SUBSCRIBE' });
    if (this.topics.indexOf(topic) === -1) {
      this.topics.push(topic);
    }
    if (!handler) return;
    if (!this.handlers[topic]) {
      this.handlers[topic] = [];
    }
    this.handlers[topic].push(handler);
  }

  unsubscribe(topic, handler) {
    this._send({ topic, namespace: this.namespace, type: 'UNSUBSCRIBE' });
    if (!handler) return;
    if (!this.handlers[topic]) return;
    const ind = this.handlers[topic].indexOf(handler);
    if (ind >= 0) this.handlers[topic].splice(ind, 1);
  }

  sendMessage(topic, msg) {
    this._send({
      topic,
      namespace: this.namespace,
      message: msg,
    });
  }

  closed() {
    this.ws.disconnect();
  }
}

export default Websocket2;