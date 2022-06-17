import { ethers } from "hardhat";
import { SignerWithAddress } from "hardhat-deploy-ethers/src/signers";
import { BigNumber } from "ethers";
import { Arbitrager } from "../typechain";
import { expect } from "chai";

const WAVAX_ADDRESS: string = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const USDT_e_ADDRESS: string = "0xc7198437980c041c805A1EDcbA50c1Ce5db95118";
const AVALANCHE_NODE_URL: string = 'https://api.avax.network/ext/bc/C/rpc';

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
                        blockNumber: 16067045,
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
        if ((await wavaxTokenContract.balanceOf(account.address)).lt("131140477242002305040")) {
            await wavaxTokenContract.deposit({
                value: BigNumber.from("131140477242002305040")
                    .sub(await wavaxTokenContract.balanceOf(account.address))
            })
        }
        expect((await wavaxTokenContract.balanceOf(arbitrager.address) as BigNumber).toString()).equals('0');
        expect((await wavaxTokenContract.balanceOf(account.address) as BigNumber).toString()).equals('131140477242002305040');
        await wavaxTokenContract.transfer(arbitrager.address, '131140477242002305040');
        expect((await wavaxTokenContract.balanceOf(account.address) as BigNumber).toString()).equals('0');
        let before = (await wavaxTokenContract.balanceOf(arbitrager.address) as BigNumber);
        expect(before.toString()).equals('131140477242002305040');
        let r = await arbitrager.arbitrage(
          ["0x5875c368Cddd5FB9Bf2f410666ca5aad236DAbD4", "0x6F3a0C89f611Ef5dC9d96650324ac633D02265D3"],
          ["LINK.e", "WAVAX"],
          '131140477242002305040');
        await r.wait();
        expect(before).lt((await wavaxTokenContract.balanceOf(arbitrager.address) as BigNumber));
    });
});
