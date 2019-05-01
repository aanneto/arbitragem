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
    var rowspan;
    var profit = 0;
    var investiment = 0;
    var changeSell = true;
    var changeBuy = true;
    var sellOrder;
    var buyOrder;
    for (
        var sellIndex = 0, buyIndex = 0, length = Math.max(
            results.sellOrders.length,
            results.buyOrders.length
        );
        (sellIndex < length) && (buyIndex < length);
    ) {
        sellOrder = results.sellOrders[sellIndex];
        buyOrder = results.buyOrders[buyIndex];
        if (changeSell) {
            rowspan = sellOrder[2];
            addCell(row, formatCurrency('BRL', sellOrder[0]), rowspan);
            addCell(row, formatCurrency('BTC', sellOrder[1]), rowspan);
            addCell(
                row,
                formatCurrency('BRL', sellOrder[0] * sellOrder[1]),
                rowspan
            );
            changeSell = false;
        }
        if (changeBuy) {
            rowspan = buyOrder[2];
            addCell(row, formatCurrency('BRL', buyOrder[0]), rowspan);
            addCell(row, formatCurrency('BTC', buyOrder[1]), rowspan);
            addCell(
                row,
                formatCurrency('BRL', buyOrder[0] * buyOrder[1]),
                rowspan
            );
            changeBuy = false;
        }
        var amount = Math.min(
            sellOrder[1],
            buyOrder[1]
        );
        investiment += sellOrder[0] * amount;
        profit += (buyOrder[0] * amount) - (sellOrder[0] * amount);
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
        sellOrder[2]--;
        buyOrder[2]--;
        if (sellOrder[2] <= 0) {
            sellIndex++;
            changeSell = true;
        }
        if (buyOrder[2] <= 0) {
            buyIndex++;
            changeBuy = true;
        }
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

function simulateOrders(ordersA, ordersB) {
    if (ordersA.asks[0][0] < ordersB.bids[0][0]) {
        return simulateSellBuyOrders(ordersA.asks, ordersB.bids);
    } else {
        return simulateSellBuyOrders(ordersB.asks, ordersA.bids);
    }
}

function simulateSellBuyOrders(sellOrders, buyOrders) {
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

        if (sellOrdersSimulation.length <= sellIndex) {
            sellOrdersSimulation.push(
                [sellOrders[sellIndex][0], amountTrade, 1]
            );
        } else {
            sellOrdersSimulation[sellIndex][1] += amountTrade;
            sellOrdersSimulation[sellIndex][2]++;
        }
        if (buyOrdersSimulation.length <= buyIndex) {
            buyOrdersSimulation.push([buyOrders[buyIndex][0], amountTrade, 1]);
        } else {
            buyOrdersSimulation[buyIndex][1] += amountTrade;
            buyOrdersSimulation[buyIndex][2]++;
        }

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
