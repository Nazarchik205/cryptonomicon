//  const API_KEY = `c5181d2887707a517db7160b1124746b61e577d3548a1cd71330123b009ae4d8`;

let tickersHandlers = new Map();

  const loadTickers = () => {
  if(tickersHandlers.size === 0){
    return;
  }
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(",")}&tsyms=USD`
  ).then(res => res.json())
  .then( rawData => { console.log(rawData.BTC.USD);  const updatedPrices =  Object.fromEntries( Object.entries(rawData).map(
                      ([ key, value ]) =>  [ key, value.USD ] ) );
                    
                     Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
                       const handlers = tickersHandlers.get(currency) ?? [];
                       handlers.forEach(fn => fn(newPrice)); 
      }); 
    });  
  console.log("Worked");
};

export const subscribeOnTicker = (ticker, cb) => {
const subscribers = tickersHandlers.get(ticker) || [];
tickersHandlers.set(ticker, [...subscribers, cb])
};

export const unsubscribeOnTicker = (ticker) => {
  
  console.log(ticker)
    tickersHandlers.delete(ticker);
    console.log(tickersHandlers);
  
};

setInterval(loadTickers, 5000);

window.tickers = tickersHandlers;
