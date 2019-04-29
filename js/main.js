(async function() {
    var exchanges = await getExchanges();
    var tbody = document.getElementById('tbody');
    for (
        var indexA = 0, length = exchanges.length;
        indexA < length;
        indexA++
    ) {
        for (var indexB = indexA + 1; indexB < length; indexB++) {
            var results = calcularMoedas(
                exchanges[indexA].orders,
                exchanges[indexB].orders
            );
            if (results.buyOrders.length > 0) {
                var row = document.createElement('tr');
                var rowspan = Math.max(
                    results.buyOrders.length,
                    results.sellOrders.length
                );

                addCellLink(
                    row,
                    exchanges[indexA].exchange.name,
                    exchanges[indexA].exchange.urls.www,
                    rowspan
                );
                addCellLink(
                    row,
                    exchanges[indexB].exchange.name,
                    exchanges[indexB].exchange.urls.www,
                    rowspan
                );

                addCell(
                    row,
                    formatCurrency('BRL', results.investiment),
                    rowspan
                );
                addCell(
                    row,
                    formatCurrency('BTC', results.amount),
                    rowspan
                );
                addCell(
                    row,
                    (
                        formatCurrency('BRL', results.profit)
                        + ' ('
                        + getFormatedProfit(results)
                        + '%)'
                    ),
                    rowspan
                );

                addCellList(tbody, row, results);
            }
        }
    }
})();
