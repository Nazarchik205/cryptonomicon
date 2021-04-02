const API_KEY = `c5181d2887707a517db7160b1124746b61e577d3548a1cd71330123b009ae4d8`;

let tickersHandlers = new Map();

let socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const INVALID_SUBS = "500";

let invalidTickers = [];
let allSubTickers = [];
let currentBTCprice = 0;
let dependingOnBTC = [];

socket.addEventListener("message", e => {
  let {
    TYPE: type,
    FROMSYMBOL: currency /*Ticker`s name*/,
    PRICE: newPrice,
    PARAMETER: parameter,
    TOSYMBOL: valuta,
    MESSAGE: message
  } = JSON.parse(e.data);

  if (currency === "BTC") currentBTCprice = newPrice;

  if (type === INVALID_SUBS && message === "INVALID_SUB") {
    let ticker = parameter.split(`~`)[2];

    if (parameter == `5~CCCAGG~${ticker}~BTC`) {
      invalidTickers.push(ticker);
      return;
    }

    if (!allSubTickers.includes("BTC")) {
      sendMessageToWs({
        action: "SubAdd",
        subs: [`5~CCCAGG~BTC~USD`]
      });
      allSubTickers.push("BTC");
    }

    sendMessageToWs({
      action: "SubAdd",
      subs: [`5~CCCAGG~${ticker}~BTC`]
    });
    dependingOnBTC.push(ticker);
  }

  if (valuta === "BTC") {
    newPrice = currentBTCprice * newPrice;
  }

  if (type != AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  allSubTickers.push(currency);
  const handlers = tickersHandlers.get(currency) || [];
  handlers.forEach(fn => {
    fn(newPrice);
  });
});

export { invalidTickers };

function sendMessageToWs(message) {
  if (socket.readyState == WebSocket.OPEN) {
    //если готовность нашего сокета*значение 1* будет ранятся значению, при котором WebSocket открыт
    socket.send(JSON.stringify(message));
  } else {
    socket.addEventListener(
      "open",
      () => socket.send(JSON.stringify(message)),
      { once: true }
    ); //ставим прослушку на событие open и выполняем его 1 раз
  }
}

function subscribeOnTickerOnWS(ticker) {
  sendMessageToWs({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function unsubscribeOnTickerOnWS(ticker) {
  sendMessageToWs({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
  if (dependingOnBTC.includes(ticker)) {
    sendMessageToWs({
      action: "SubRemove",
      subs: [`5~CCCAGG~${ticker}~BTC`]
    });
  }
  dependingOnBTC.filter(t => t !== ticker);
}

export const subscribeOnTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeOnTickerOnWS(ticker);
};

export const unsubscribeOnTicker = ticker => {
  tickersHandlers.delete(ticker);
  unsubscribeOnTickerOnWS(ticker);
};

export const coinList = async () => {
  const f = await fetch("https://min-api.cryptocompare.com/data/all/coinlist");
  let coinListData = await f.json();
  return coinListData.Data;
};

window.tickers = tickersHandlers;
