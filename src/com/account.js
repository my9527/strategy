
import Datafeed from '../lib/datafeed';
import http from '../lib/http';
import log from '../lib/log';

class Account {
    datafeed;
    dirty = true;
    info = {};

    constructor(datafeed) {

        if (datafeed instanceof Datafeed) {
            this.datafeed = datafeed;
        } else {
            this.datafeed = new Datafeed();
        }
    }

    getAccount = () => {
        return {
            dirty: this.dirty,
            acc: this.info,
        };
    }
    
    // update by websocket
    updateByMessage = (subject, data) => {
        switch(subject) {
            case 'orderMargin.change':
            case 'availableBalance.change':
            {
                this.info = {
                    ...this.info,
                    ...data,
                };
                this.dirty = false;
            }
            break;
            default:
            // withdrawHold.change
            break;
        }
    }

    // rebuild
    rebuild = async () => {
        this.dirty = true;
        const res = await this.getOverview();
        if (res !== false) {
            if (res) {
                this.info = res;
            } else {
                this.info = {};
            }
            this.dirty = false;
        }
    }

    getOverview = async () => {
        // GET /api/v1/account-overview
        let result = false;

        try {
            /*
            { 
                "code": "200000",
                "data": {
                    "accountEquity": 99.8999305281, //账户权益
                    "unrealisedPNL": 0, //未实现盈亏
                    "marginBalance": 99.8999305281, //保证金余额
                    "positionMargin": 0, //仓位保证金
                    "orderMargin": 0, //委托保证金
                    "frozenFunds": 0, //转出提现冻结
                    "availableBalance": 99.8999305281 //可用余额
                }
            }
            */
            const { data } = await http.get('/api/v1/account-overview');
            result = data;
        } catch (e) {
            log('get account overview error', e);
        }
        return result;
    }

    listen = () => {
        this.datafeed.connectSocket();
        this.datafeed.onClose(() => {
            log('ws closed, status ', this.datafeed.trustConnected);
            this.rebuild();
        });

        const topic = `/contractAccount/wallet`;
        this.datafeed.subscribe(topic, (message) => {
            if (message.topic === topic &&
                message.userId // private message
            ) {
                // log(message);
                this.updateByMessage(message.subject, message.data);
            }
        });
        this.rebuild();
    }

}

export default Account;