//? Shared Worker version

// let connected = false;
// self.addEventListener("connect", e => {
//   console.log("eee", e);
//   e.source.addEventListener("message", ev => {
//     console.log("evvv", ev.data);
//     if (ev.data === "start") {
//       if (connected === false) {
//         e.source.postMessage("worker init");
//         connected = true;
//       } else {
//         e.source.postMessage("worker already inited");
//       }
//     }
//   });
//   e.source.start();
// });

//! Я НЕ ЗНАЮ КАК И ПОЧЕМУ ЭТО НЕ РАБОТАЕТ

self.onconnect = e => {
  const port = e.ports[0];
  port.onmessage = function(e) {
    console.log("eDATA", e);
    let num = e.data;
    if (!isNaN(num)) {
      port.postMessage(num * 5);
    } else {
      port.postMessage("Wrong number!");
      throw new Error("Wrong number!");
    }
  };
};
