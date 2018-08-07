
const Stream = require('./stream');
const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const feedIdIn = process.env.ADAFRUIT_FEED_ID_IN;
const rxjs = require('rxjs');
const { logInfo, logSuccess, logErrorAndExit } = require('./logger');

const host = 'io.adafruit.com';
const port = 8883;



class IncomingStream {
    constructor() {
        this.stream = new Stream({
            type: 'feeds',
            username,
            key,
            host,
            port,
            id: feedIdIn
        });
    }

    connect() {
        this.stream.connect();
    }

    onMessage() {
        return rxjs.Observable.create(observer => {
            this.stream.on('message', data => {
                const parsedData = JSON.parse(data.toString('utf8'));
                logInfo('Received message ' + JSON.stringify(parsedData));
                observer.next(JSON.parse(parsedData.data.value));
            });
        });
    }

    async waitForNextMessage(requestId) {
        return new Promise((resolve, reject) => {
            const observ = this.onMessage();
            observ.subscribe(data => {
                if (data.requestId === requestId) {
                    resolve(data);
                }
            });
        });

    }
}

module.exports = IncomingStream;


