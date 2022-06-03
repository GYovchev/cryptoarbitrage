let ethers = require('ethers');
let fs = require('fs');
let moralisProvider = new ethers.providers.JsonRpcProvider(`https://speedy-nodes-nyc.moralis.io/f9e87192cf737ca99dafaaef/avalanche/mainnet`)

let interfaces;

let snowTraceAPIKey = "2A6N83I1PQCEWTRRPMUBB8ICNQSBP8Z2T4";

async function getSetOfPairs() {
  let tx = [];
  let page=1;
  while(true) {
    let response = await ethers.utils.fetchJson(`https://api.snowtrace.io/api?module=account&action=txlist&address=0x000000004edf117e7d051d0de2712a5c527678b3&sort=asc&page=${page}&offset=10000&apikey=` + snowTraceAPIKey);
    if (response.status !== "1") {
      console.error(JSON.stringify(response));
      break;
    }
    tx.push(...response.result.filter(t => t.txreceipt_status === "1"));
    page++;
  }

  let swapAddresses = new Set();
  console.log(`Extracting data from ${tx.length} transactions`);
  for(let i = 0; i < tx.length; i++) {
    swapAddresses = new Set([...swapAddresses, ...(await getTransactionSwapAddresses(tx[i].hash))]);
    if(i > 9 && i%10 === 0) {
      console.log(`Extracted data from ${i+1} transactions`);
    }
  }
  return swapAddresses;
}

async function getTransactionSwapAddresses(tx, retry = 2) {
  try {
    let transaction = await moralisProvider.getTransactionReceipt(tx);
    let swapAddresses = new Set();
    for(let i = 0; i < transaction.logs.length; i++) {
      if(transaction.logs[i].data.length === 258) {
        for(let j = 0; j < interfaces.length; j++) {
          if(interfaces[j].parseLog(transaction.logs[i])) {
            swapAddresses.add(transaction.logs[i].address)
            break;
          }
        }
      }
    }
    return swapAddresses;
  } catch(e) {
    if(retry > 0) {
      await getTransactionSwapAddresses(tx, retry-1);
    } else {
      console.error(e);
    }
  }

}

async function main() {
  interfaces = Object.values(JSON.parse(fs.readFileSync('../abis/list.json')));
  for(let i = 0; i < interfaces.length; i++) {
    interfaces[i] = new ethers.utils.Interface(interfaces[i]);
  }
  fs.writeFileSync('../data/pairaddresses.json', JSON.stringify([...(await getSetOfPairs())]));
}

main().catch(console.error);