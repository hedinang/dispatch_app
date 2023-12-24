import Sockette from 'sockette';

class Websocket {
    constructor() {
        this.connected = false
        this.ws = new Sockette(`${process.env.REACT_APP_WS}`, {
            timeout: 5e3,
            maxAttempts: 10,
            onopen: e => {
              // console.log('Websocket Connected');
              // this.activeSchedule.ws.json({target: 'SUBSCRIBE', content: 'SCHEDULE_' + this.activeSchedule.id});
              // this.subscribe('TEST', (m) => console.log(m));
              this.connected = true
              // console.log('Registering', this.topics)
              if (this.topics) {
                this.topics.forEach(t => {
                  this.ws.json({channels: ['SUBSCRIBE'], message: t})
                })
              }
            },
            onmessage: (e) => this.handleMessage(this, e),
            onreconnect: e => console.log('Reconnecting...', e),
            onmaximum: e => console.log('Stop Attempting!', e),
            onclose: e => console.log('Closed!', e),
            onerror: e => console.log('Error:', e)
        });
        this.handlers = {}
        this.topics = []
    }

    handleMessage(that, e) {
        let result = JSON.parse(e.data);
        result.channels.filter(c => c.indexOf("TOPIC@") === 0).map(c => c.substring(6)).forEach(c => {
            let handlers = this.handlers[c]
            if (!handlers) 
                return
            handlers.forEach(handler => handler(result.message))
        });
    }

    _send(msg) {
        if (!this.connected)
            return
        this.ws.json(msg)
    }

    subscribe(topic, handler) {
        this._send({channels: ['SUBSCRIBE'], message: topic})
        this.topics.push(topic)
        if (!handler)
            return
        if (!this.handlers[topic]) {
            this.handlers[topic] = []
        }
        this.handlers[topic].push(handler)
    }

    unsubscribe(topic, handler) {
        this._send({channels: ['UNSUBSCRIBE'], message: topic})
        if (!handler)
            return
        if (!this.handlers[topic])
            return
        let ind = this.handlers[topic].indexOf(handler)
        if (ind >= 0)
        this.handlers[topic].splice(ind, 1)
    }

    sendMessage(topic, msg) {
        this._send({
            channels: [ `TOPIC@${topic}` ],
            message: msg
        })
    }
}

export default Websocket;