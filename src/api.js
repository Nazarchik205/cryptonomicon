//  const API_KEY = `c5181d2887707a517db7160b1124746b61e577d3548a1cd71330123b009ae4d8`;

export const loadTickers = tickers => 
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(",")}&tsyms=USD`
  ).then(res => res.json())
  .then( rawData => { console.log(rawData.BTC.USD);return Object.fromEntries( Object.entries(rawData).map(
                      ([ key, value ]) =>  [ key, value.USD ] ) ) } );
   console.log("Worked");

