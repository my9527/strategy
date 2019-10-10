import _ from 'lodash';
import Datafeed from '../lib/datafeed';
import log from '../lib/log';

class Level3 {
    datafeed;
    symbol;
    snapshot = {
        dirty: true,
        data: null,
    };
    debug = false;

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
            this.debug && log('level3 ws closed, status ', this.datafeed.trustConnected);
        });
    }

    sub = (topic, callback) => {
        // const level3Keys = ['side', 'size', 'price', 'takerOrderId', 'makerOrderId', 'tradeId', 'clientOid', 'orderId']
        this.datafeed.subscribe(topic, (message) => {
            if (message.data) {
                callback(message.data)
            }
            
        });
    }
}

export default Level3;