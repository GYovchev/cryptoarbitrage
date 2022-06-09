const {contract} = require("../lib/utils");
const ethers = require("ethers");
const {moralisProvider, BigDecimal} = require("./utils");

function Token(address, symbol, decimals) {
  this.address = address;
  this.symbol = symbol;
  this.decimals = decimals;
}

function Pair(address, token0, token1, abi) {
  this.address = address;
  this.token0 = token0;
  this.token1 = token1;
  this.abi = abi;
}

Pair.prototype.getPrices = async function (options) {
  let c = new ethers.Contract(this.address, this.abi, moralisProvider);
  const reserves = await c.getReserves(options)
  const amountIn = ethers.utils.parseUnits(
    reserves[0].toString(),
    this.token1.decimals
  )
  const amountOut = ethers.utils.parseUnits(
    reserves[1].toString(),
    this.token0.decimals
  )
  return [amountIn/amountOut, amountOut/amountIn];
}

Pair.fromAddress = async function (address) {
  try {
    let c = await contract(address);
    const tokenAddress0 = await c.token0();
    const tokenAddress1 = await c.token1();

    const tokenContract0 = await contract(tokenAddress0);
    const tokenContract1 = await contract(tokenAddress1);

    const tokenSymbol0 = await tokenContract0.symbol()
    const tokenSymbol1 = await tokenContract1.symbol()

    const tokenDecimals0 = await tokenContract0.decimals()
    const tokenDecimals1 = await tokenContract1.decimals()

    let token0 = new Token(tokenAddress0, tokenSymbol0, tokenDecimals0);
    let token1 = new Token(tokenAddress1, tokenSymbol1, tokenDecimals1);

    return new Pair(address, token0, token1, c.interface.format('json'));
  } catch(e) {
    console.error(e);
  }
}

module.exports = {
  Pair, Token,
}