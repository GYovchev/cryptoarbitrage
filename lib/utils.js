const ethers = require("ethers");

let snowTraceAPIKey = "2A6N83I1PQCEWTRRPMUBB8ICNQSBP8Z2T4";
let moralisProvider = new ethers.providers.JsonRpcProvider(`https://speedy-nodes-nyc.moralis.io/f9e87192cf737ca99dafaaef/avalanche/mainnet`)

async function contract(address) {
  const a = await Promise.resolve(address);
  //TODO for non-verified contracts, try proxy or erc20?
  const url = `https://api.snowtrace.io/api?module=contract&action=getsourcecode&address=${a}&apikey=${snowTraceAPIKey}`;
  const response = await ethers.utils.fetchJson(url);
  if (response.status !== "1") {
    throw new Error('asd');
  }
  const theAbi = response.result[0].ABI;
  return new ethers.Contract(a, JSON.parse(theAbi), moralisProvider)
}

module.exports = {
  snowTraceAPIKey,
  moralisProvider,
  contract
}