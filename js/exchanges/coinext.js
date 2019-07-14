const http = require('http')

const URL = 'https://api.coinext.com.br:8443/AP/GetL2Snapshot?OMSId=1&InstrumentId=1&Depth=1';

class CoinextExchange {
    constructor() {
        this.id = 'coinext';
        this.name = 'Coinext';
        this.urls = {
            www: 'https://coinext.com.br/'
        };
    }
    
    getOrders() {
        return new Promise(function(resolve, reject) {
            http.get(
                {path: URL},
                function (response) {
                    let responseText = '';
                    response.on('data', function (buffer) {
                        responseText += buffer;
                    });

                    response.on('end', function () {
                        let result = {
                            asks: [],
                            bids: []
                        };
                        var responseJSON = JSON.parse(responseText);
                        for (let i = 0, length = responseJSON.length; i < length; i++) {
                            let order = responseJSON[i];
                            if (order[9] === 0) {
                                result.bids.push([order[6], order[8]]);
                            } else {
                                result.asks.push([order[6], order[8]]);
                            }
                        }
                        
                        resolve(result);
                    });
                }
            );
        });
    }
}

module.exports = {
    CoinextExchange: CoinextExchange
};
