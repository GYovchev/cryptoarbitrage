let fs = require('fs');
let {sleep} = require('../lib/utils');
let {Pair} = require('../lib/models');

async function main() {
  let pairAddresses = JSON.parse(fs.readFileSync('../data/pairaddresses.json').toString());
  let pairs = [];
  console.log(`Generating ${pairAddresses.length} pairs...`);
  for(let i = 0; i < pairAddresses.length; i++) {
    if(i > 0 && i % 10 === 0) {
      console.log(`Generated ${i} pairs...`);
    }
    let p = await Pair.fromAddress(pairAddresses[i]);
    if(p) pairs.push(p);
    await sleep(600); // rate limit 5 requests per sec
  }
  fs.writeFileSync('../data/pairsdata.json', JSON.stringify(pairs));
}

main().catch(console.error);