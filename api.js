//variavel recebe axios para chamadas HTTP
const axios = require('axios');
const queryString = require('querystring');
//função de criptografia do node
const crypto = require('crypto');
//importar chaves do .env
const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;
const apiUrl = process.env.API_URL;

//função para chamadas privadas a API
async function privateCall(path, data = {}, method = 'GET') {
    //gera o horario atual da requisição
    const timestamp = Date.now();
    //gera a hash SHA256 da consulta
    const signature = crypto.createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, timestamp })}`)
        .digest('hex');
 
    const newData = { ...data, timestamp, signature };
    const qs = `?${queryString.stringify(newData)}`;
    //console.log(qs);

    //em caso de requisição HTTPS 200 ou erro
    try {
        const result = await axios({
            method,
            url: `${apiUrl}${path}${qs}`,
            headers: { 'X-MBX-APIKEY': apiKey }
        })
        return result.data;
    } 
    catch (err) {
        console.log(err);
    }
}
//função para criar uma nova ordem
async function newOrder(symbol, quantity, price, side = 'BUY', type = 'MARKET'){
    const data = {symbol, side, type, quantity};
    if(price) data.price = price;
    if(type === 'LIMIT') data.timeInForce = 'GTC';
    return privateCall('/v3/order', data, 'POST');
}

//função para consultar carteira
async function accountInfo(){
    return privateCall('/v3/account');
}

//função para chamadas diretamente a API e retorno
//path = caminho,  data = dados da requisição
async function publicCall(path, data, method = 'GET'){
    try{
        //parametros
        const qs = data ? `?${queryString.stringify(data)}` : '';
        const result = await axios({
            method,
            url: `${apiUrl}${path}${qs}`
        })
        return result.data;
    }
    catch (err){
        //caso haja erro volta para o console
        console.log(err);
    }
}

async function time() {
    // retorna o horario do servidor binannce
    return publicCall('/v3/time');
}

async function depth(symbol = 'BTCBRL', limit = 5) {
    return publicCall('/v3/depth', { symbol, limit });
}

async function exchangeInfo() {
    return publicCall('/v3/exchangeInfo');
}

module.exports = {time, depth, exchangeInfo, accountInfo, newOrder}