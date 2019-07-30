const http = require('http')

const URL = 'https://markets.bisq.network/api/offers?market=btc_brl';

class BisqExchange {
    constructor() {
        this.id = 'bisq';
        this.name = 'Bisq';
        this.urls = {
            www: 'https://bisq.network/pt-pt/'
        };
    }
    
    getOrders() {
        return new Promise(function(resolve, reject) {
            http.get(
                {path: URL},
                function (response) {
                    let responseText = '';
                    response.on('data', function(buffer) {
                        responseText += buffer;
                    });

                    response.on('end', function() {
                        let result = {
                            asks: [],
                            bids: []
                        };
                        var responseJSON = JSON.parse(responseText).btc_brl;
                        for (
                            let i = 0, length = responseJSON.buys.length;
                            i < length;
                            i++
                        ) {
                            let order = responseJSON.buys[i];
                            result.bids.push([parseFloat(order.price), parseFloat(order.amount)]);
                        }
                        for (
                            let i = 0, length = responseJSON.sells.length;
                            i < length;
                            i++
                        ) {
                            let order = responseJSON.sells[i];
                            result.asks.push([parseFloat(order.price), parseFloat(order.amount)]);
                        }
                        
                        resolve(result);
                    });
                }
            );
        });
    }
}

module.exports = {
    BisqExchange: BisqExchange
};
