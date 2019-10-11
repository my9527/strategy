import _ from 'lodash';
import Datafeed from '../lib/datafeed';
import log from '../lib/log';

class Socket {
    datafeed;
    symbol;

    constructor(symbol, datafeed) {
        this.symbol = symbol;

        if (datafeed instanceof Datafeed) {
            this.datafeed = datafeed;
        } else {
            this.datafeed = new Datafeed();
        }
    }

    listen = () => {
        this.datafeed.connectSocket();
        this.datafeed.onClose(() => {
            this.debug && log('ws closed, status ', this.datafeed.trustConnected);
        });
    }

    sub = (topic, callback) => {
        this.datafeed.subscribe(topic, (message) => {
            if (message.data) {
                callback(message.data)
            }
            
        });
    }
}

export default Socket;