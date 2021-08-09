const api = require('./api');
const symbol = process.env.SYMBOL;
const profitability = parseFloat(process.env.PROFITABILITY);
const coin = process.env.COIN;
const goodBuy = process.env.GOOD_BUY;

console.log('Iniciando monitoramento!');
//função que executa de tempos em tempos de acordo com a variavel CRAWLER_INTERVAL
setInterval(async () => {
    //console.log(await api.time());
    const result = await api.depth(symbol);
    // função que verifica se exite livro de ordens no par atual e imprime na tela
    if (result.bids && result.bids.length) {
        console.log(`MAIOR PREÇO DE COMPRA: ${result.bids[0][0]}`);
        buy = parseFloat(result.bids[0][0]);
    }

    if (result.bids && result.bids.length) {
        console.log(`MENOR PREÇO DE VENDA: ${result.asks[0][0]}`);
        sell = parseFloat(result.asks[0][0]);
    }

    if (sell && sell < goodBuy) {
        console.log('HORA DE COMPRAR!!!');
        const account = await api.accountInfo();
        const coins = account.balance.filter(b => symbol.indexOf(b.asset) !== -1);
        console.log('POSIÇÃO DA CARTEIRA');
        console.log(coins);
        console.log('VERIFICANDO SE A DINHEIRO DISPONIVEL PARA COMPRA!!!')
        if(sell <= parseFloat(coins.find(c => c.asset === coin).free)){
            console.log('COMPRANDO AGORA!!!');
            const buyOrder = await api.newOrder(symbol, );
            console.log(`orderId: ${buyOrder.orderId}`);
            console.log(`status: ${buyOrder.status}`);

            //VENDA DE ACORDO COM A PORCENTAGEM
            if (buyOrder.status === 'FILLED') {
                console.log('POSICIONANDO VENDA FUTURA...');
                const price = parseFloat(sell * profitability).toFixed(5);
                console.log(`Vendendo por ${price} (${profitability})`);
                const sellOrder = await api.newOrder(symbol, 1, price, 'SELL', 'LIMIT');
                console.log(`ID DA ORDEM: ${sellOrder.orderId}`);
                console.log(`STATUS: ${sellOrder.status}`);
            }
        }
    }
    else if (buy && buy > 1000) {
        console.log('HORA DE VENDER!!!');
    }
    else {
        console.log('AGUARDANDO NOVA COTAÇÃO!!!');
    }
    //função abaixo tras os pares que podem ser operados na binance
    //console.log(await api.exchangeInfo());
}, process.env.CRAWLER_INTERVAL);