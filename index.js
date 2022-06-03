let ethers = require('ethers');
const { contract } = require("./lib/utils");

async function getPrices(c) {
  const tokenAddress0 = await c.token0();
  const tokenAddress1 = await c.token1();

  const tokenContract0 = await contract(tokenAddress0);
  const tokenContract1 = await contract(tokenAddress1);

  const tokenSymbol0 = await tokenContract0.symbol()
  const tokenSymbol1 = await tokenContract1.symbol()
  const tokenDecimals0 = await tokenContract0.decimals()
  const tokenDecimals1 = await tokenContract1.decimals()

  const reserves = await c.getReserves()
  const amountIn = ethers.utils.parseUnits(
    reserves[0].toString(),
    tokenDecimals1
  )
  const amountOut = ethers.utils.parseUnits(
    reserves[1].toString(),
    tokenDecimals0
  )
  console.log(amountIn.toString())
  console.log(amountOut.toString())
  console.log(`Price of ${tokenSymbol0}/${tokenSymbol1} is ${amountIn/amountOut}`);
}

async function main() {

  // let UNISWAP_ROUTER_CONTRACT = await contract(UNISWAP_ROUTER_ADDRESS);
  // await getPrices(UNISWAP_ROUTER_CONTRACT);

}

main().catch(console.error);