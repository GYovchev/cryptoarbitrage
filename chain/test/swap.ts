import { ethers } from "hardhat";
import { SignerWithAddress } from "hardhat-deploy-ethers/src/signers";
import { BigNumber } from "ethers";
import { Arbitrager } from "../typechain";
import { expect } from "chai";

const WAVAX_ADDRESS: string = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const AVALANCHE_NODE_URL: string = process.env.AVALANCHE_MAINNET_URL as string;

describe("Arbitrage test", function () {
    let arbitrager: Arbitrager;
    let account: SignerWithAddress;
    beforeEach(async function () {
        await ethers.provider.send(
            "hardhat_reset",
            [
                {
                    forking: {
                        jsonRpcUrl: AVALANCHE_NODE_URL,
                        blockNumber: 15921208,
                    },
                },
            ],
        );
        let accounts = await ethers.getSigners()
        // @ts-ignore
        account = accounts[0]
        const arbitragerFactory = await ethers.getContractFactory("Arbitrager")
        arbitrager = await arbitragerFactory.deploy();
    });

    it("should work", async function () {
        const wavaxTokenContract = await ethers.getContractAt("IWAVAX", WAVAX_ADDRESS);
        if ((await wavaxTokenContract.balanceOf(account.address)).lt("1000000000000000000000")) {
            await wavaxTokenContract.deposit({
                value: BigNumber.from("1000000000000000000000")
                    .sub(await wavaxTokenContract.balanceOf(account.address))
            })
        }
        console.log(await wavaxTokenContract.balanceOf(account.address));
        await wavaxTokenContract.approve(arbitrager.address, ethers.constants.MaxUint256);
        await wavaxTokenContract.approve('0xeD8CBD9F0cE3C6986b22002F03c6475CEb7a6256', ethers.constants.MaxUint256);
        // let r = await arbitrager.arbitrage(
        //   ["0xeD8CBD9F0cE3C6986b22002F03c6475CEb7a6256", "0x708c1b2ae45d9F5986bF4fcB0A0120fe0DB20dC3", "0x0b212115882252E3640839feACF6CD45a8f419F5", "0xcBb424fd93cDeC0EF330d8A8C985E8b147F62339"],
        //   ["USDT.e", "USDC.e", "MIM", "WAVAX"],
        //   1000000000);
        let r = await arbitrager.arbitrage(
          ["0xeD8CBD9F0cE3C6986b22002F03c6475CEb7a6256"],
          ["USDT.e"],
          1000000000);
        console.log(await wavaxTokenContract.balanceOf(account.address));
    });
});
