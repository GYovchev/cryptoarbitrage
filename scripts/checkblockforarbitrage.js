let fs = require('fs');
let {sleep} = require('../lib/utils');
let {Pair, Token} = require('../lib/models');
const {Graph, Edge} = require("../lib/bellmanford");

const BLOCK = 15699685;

async function main() {
  let id = 0;
  let s = {};
  let sid = {};
  let pairsData = JSON.parse(fs.readFileSync('../data/pairsdata.json').toString());
  pairsData = pairsData.map(pd => new Pair(pd.address, new Token(pd.token0.address, pd.token0.symbol, pd.token0.decimals), new Token(pd.token1.address, pd.token1.symbol, pd.token1.decimals), pd.abi));
  for (let i = 0; i < pairsData.length; i++) {
    pairsData[i].prices = await pairsData[i].getPrices({blockTag: BLOCK});
    pairsData[i].token0.price = pairsData[i].prices[0];
    pairsData[i].token1.price = pairsData[i].prices[1];
    if(s[pairsData[i].token0.symbol] == null) {
      s[pairsData[i].token0.symbol] = id;
      sid[id] = pairsData[i].token0;
      id++;
    }
    if(s[pairsData[i].token1.symbol] == null) {
      s[pairsData[i].token1.symbol] = id;
      sid[id] = pairsData[i].token1;
      id++;
    }
  }
  let graph = new Graph(Object.keys(pairsData).length);
  for(let i = 0; i < pairsData.length; i++) {
    graph.addEdge(new Edge(s[pairsData[i].token0.symbol], s[pairsData[i].token1.symbol], pairsData[i].prices[0]));
    graph.addEdge(new Edge(s[pairsData[i].token1.symbol], s[pairsData[i].token0.symbol], pairsData[i].prices[1]));
  }
  fs.writeFileSync('./asd.json', JSON.stringify(graph.edges))
  let r = graph.findNegativeCycle(1);
  if(r.length > 0) {
    console.log(r.map(a => sid[a].symbol));
    console.log(r.map(a => sid[a].price));
  }
}

main().catch(console.error);