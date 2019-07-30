const http = require('http')

const URL = 'https://api.bitcointrade.com.br/v2/public/BRLBTC/orders';

class BitcoinTradeExchange {
    constructor() {
        this.id = 'bitcointrade';
        this.name = 'BitcoinTrade';
        this.urls = {
            www: 'https://www.bitcointrade.com.br/'
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
                        var responseJSON = JSON.parse(responseText).data;
                        for (
                            let i = 0, length = responseJSON.bids.length;
                            i < length;
                            i++
                        ) {
                            let order = responseJSON.bids[i];
                            result.bids.push([order.unit_price, order.amount]);
                        }
                        for (
                            let i = 0, length = responseJSON.asks.length;
                            i < length;
                            i++
                        ) {
                            let order = responseJSON.asks[i];
                            result.asks.push([order.unit_price, order.amount]);
                        }
                        
                        resolve(result);
                    });
                }
            );
        });
    }
}

module.exports = {
    BitcoinTradeExchange: BitcoinTradeExchange
};
