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
  let jsonAbi;
  try {
    jsonAbi = JSON.parse(theAbi)
  } catch {
    console.error(`Error parsing ABI: ${theAbi}`);
  }

  return new ethers.Contract(a, jsonAbi, moralisProvider)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class BigDecimal {
  // Configuration: constants
  static DECIMALS = 18; // number of decimals on all instances
  static ROUNDED = true; // numbers are truncated (false) or rounded (true)
  static SHIFT = BigInt("1" + "0".repeat(BigDecimal.DECIMALS)); // derived constant
  constructor(value) {
    if (value instanceof BigDecimal) return value;
    let [ints, decis] = String(value).split(".").concat("");
    this._n = BigInt(ints + decis.padEnd(BigDecimal.DECIMALS, "0")
        .slice(0, BigDecimal.DECIMALS))
      + BigInt(BigDecimal.ROUNDED && decis[BigDecimal.DECIMALS] >= "5");
  }
  static fromBigInt(bigint) {
    return Object.assign(Object.create(BigDecimal.prototype), { _n: bigint });
  }
  add(num) {
    return BigDecimal.fromBigInt(this._n + new BigDecimal(num)._n);
  }
  subtract(num) {
    return BigDecimal.fromBigInt(this._n - new BigDecimal(num)._n);
  }
  static _divRound(dividend, divisor) {
    return BigDecimal.fromBigInt(dividend / divisor
      + (BigDecimal.ROUNDED ? dividend  * 2n / divisor % 2n : 0n));
  }
  multiply(num) {
    return BigDecimal._divRound(this._n * new BigDecimal(num)._n, BigDecimal.SHIFT);
  }
  divide(num) {
    return BigDecimal._divRound(this._n * BigDecimal.SHIFT, new BigDecimal(num)._n);
  }
  toString() {
    const s = this._n.toString().padStart(BigDecimal.DECIMALS+1, "0");
    return s.slice(0, -BigDecimal.DECIMALS) + "." + s.slice(-BigDecimal.DECIMALS)
      .replace(/\.?0+$/, "");
  }
}

module.exports = {
  snowTraceAPIKey,
  moralisProvider,
  contract,
  sleep,
  BigDecimal,
}