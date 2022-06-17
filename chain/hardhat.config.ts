import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/types";
import * as dotenv from "dotenv";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 43114,
      gasPrice: 30402582315,
      throwOnTransactionFailures: false,
      loggingEnabled: true,
      forking: {
        url: 'https://api.avax.network/ext/bc/C/rpc',
        enabled: true,
        blockNumber: 16067046
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;