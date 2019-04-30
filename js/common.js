function getFractionDigits(currency) {
    if (currency == 'BRL') {
        return {minimumFractionDigits: 2, maximumFractionDigits: 2};
    } else if (currency == 'BTC') {
        return {minimumFractionDigits: 8, maximumFractionDigits: 8};
    }
}

function formatCurrency(currency, value) {
    var fractionDigits = getFractionDigits(currency);
    return value.toLocaleString(
        undefined,
        {
            minimumFractionDigits: fractionDigits.minimumFractionDigits,
            maximumFractionDigits: fractionDigits.maximumFractionDigits,
            currency: currency,
            currencySymbol: 'symbol',
            useGrouping: false
        }
    );
}

function sortExchanges(exchangeA, exchangeB) {
    if (exchangeA.orders.asks[0][0] < exchangeB.orders.asks[0][0]) {
        return -1;
    } else if (exchangeA.orders.asks[0][0] > exchangeB.orders.asks[0][0]) {
        return 1;
    } else {
        if (exchangeA.orders.bids[0][0] > exchangeB.orders.bids[0][0]) {
            return -1;
        } else if (exchangeA.orders.bids[0][0] < exchangeB.orders.bids[0][0]) {
            return 1;
        } else {
            return 0;
        }
    }
}

function addCell(row, text, rowspan) {
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode(text));
    if (rowspan > 1) {
        cell.setAttribute('rowspan', rowspan.toString());
    }
    row.appendChild(cell);
}

function addCellLink(row, text, url, rowspan) {
    var cell = document.createElement('td');
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.appendChild(document.createTextNode(text));
    cell.appendChild(link);
    if (rowspan > 1) {
        cell.setAttribute('rowspan', rowspan.toString());
    }
    row.appendChild(cell);
}

function addCellList(tbody, row, results) {
    var profit = 0;
    var investiment = 0;
    for (var i = 0, length = results.buyOrders.length; i < length; i++) {
        addCell(row, formatCurrency('BRL', results.sellOrders[i][0]), 1);
        addCell(row, formatCurrency('BTC', results.sellOrders[i][1]), 1);
        addCell(
            row,
            formatCurrency(
                'BRL',
                results.sellOrders[i][0] * results.sellOrders[i][1]
            ),
            1
        );
        addCell(row, formatCurrency('BRL', results.buyOrders[i][0]), 1);
        addCell(row, formatCurrency('BTC', results.buyOrders[i][1]), 1);
        addCell(
            row,
            formatCurrency(
                'BRL',
                results.buyOrders[i][0] * results.buyOrders[i][1]
            ),
            1
        );
        investiment += results.sellOrders[i][0] * results.sellOrders[i][1];
        profit += (
            (results.buyOrders[i][0] * results.buyOrders[i][1])
            - (results.sellOrders[i][0] * results.sellOrders[i][1])
        );
        addCell(
            row,
            (
                formatCurrency('BRL', profit)
                + ' ('
                + (profit/investiment * 100).toLocaleString(
                    undefined,
                    {minimumFractionDigits: 0, maximumFractionDigits: 2}
                )
                + '%)'
            ),
            1
        );
        tbody.appendChild(row);
        row = document.createElement('tr');
    }
}

function getFormatedProfit(results) {
    if (results.investiment == 0) {
        return 0;
    }
    return (results.profit/results.investiment * 100).toLocaleString(
        undefined,
        {minimumFractionDigits: 0, maximumFractionDigits: 2}
    );
}

function calcularMoedas(ordersA, ordersB) {
    if (ordersA.asks[0][0] < ordersB.bids[0][0]) {
        return calcularMoedasMenorMaior(ordersA.asks, ordersB.bids);
    } else {
        return calcularMoedasMenorMaior(ordersB.asks, ordersA.bids);
    }
}

function calcularMoedasMenorMaior(sellOrders, buyOrders) {
    var minimumValue = sellOrders[0][0];
    var maximumValue = buyOrders[0][0];

    var investiment = 0;
    var profit = 0;
    var amount = 0;
    var amountTrade = 0;
    sellOrders = sellOrders.map(function(arr) {
        return arr.slice();
    });
    buyOrders = buyOrders.map(function(arr) {
        return arr.slice();
    });
    var sellOrdersSimulation = [];
    var buyOrdersSimulation = [];

    var sellIndex = 0;
    var buyIndex = 0;

    while (
        (sellOrders[sellIndex][0] < maximumValue)
        && (buyOrders[buyIndex][0] > minimumValue)
        && (sellOrders[sellIndex][0] < buyOrders[buyIndex][0])
    ) {
        if (
            sellOrders[sellIndex][1]
            < buyOrders[buyIndex][1]
        ) {
            amountTrade = sellOrders[sellIndex][1];
        } else {
            amountTrade = buyOrders[buyIndex][1];
        }

        sellOrders[sellIndex][1] -= amountTrade;
        buyOrders[buyIndex][1] -= amountTrade;
        amount += amountTrade;
        investiment += (
            amountTrade * sellOrders[sellIndex][0]
        );
        profit += (
            (amountTrade * buyOrders[buyIndex][0])
            - (amountTrade * sellOrders[sellIndex][0])
        );

        sellOrdersSimulation.push([sellOrders[sellIndex][0], amountTrade]);
        buyOrdersSimulation.push([buyOrders[buyIndex][0], amountTrade]);

        if (sellOrders[sellIndex][1] === 0) {
            sellIndex++;
        }
        if (buyOrders[buyIndex][1] === 0) {
            buyIndex++;
        }
        if (
            (sellOrders.length <= sellIndex)
            || (buyOrders.length <= buyIndex)
        ) {
            break;
        }
    }

    return {
        investiment: investiment,
        profit: profit,
        amount: amount,
        buyOrders: buyOrdersSimulation,
        sellOrders: sellOrdersSimulation
    };
}

async function getExchanges() {
    var mercado = new ccxt.mercado();
    var negociecoins = new ccxt.negociecoins();
    var braziliex = new ccxt.braziliex(
        {'proxy': 'https://cors-anywhere.herokuapp.com/'}
    );

    var exchanges = [
        {
            exchange: mercado,
            orders: await mercado.fetchOrderBook('BTC/BRL')
        },
        {
            exchange: negociecoins,
            orders: await negociecoins.fetchOrderBook('BTC/BRL')
        },
        {
            exchange: braziliex,
            orders: await braziliex.fetchOrderBook('BTC/BRL')
        }
    ];

    exchanges.sort(sortExchanges);
    return exchanges;
}
