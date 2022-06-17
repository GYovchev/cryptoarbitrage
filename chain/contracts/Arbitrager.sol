pragma solidity 0.8.4;

import "hardhat/console.sol";

interface IPair {
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IRouter {
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint value) external;
    function approve(address to, uint value) external returns (bool);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract Arbitrager {

    address private pangolinRouterAddress = 0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106;
    address private pangolinFactoryAddress = 0xefa94DE7a4656D787667C749f7E1223D71E9FD88;

    address private traderJoeRouterAddress = 0x60aE616a2155Ee3d9A68541Ba4544862310933d4;
    address private traderJoeFactoryAddress = 0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10;

    address private uniswapV2RouterAddress;
    address private uniswapV2FactoryAddress = 0xc35DADB65012eC5796536bD9864eD8773aBc74C4;

    constructor() {}

    function arbitrage(address[] calldata pairsPath, string[] calldata symbolPath, uint256 amountIn) public {
        IPair[10] memory pairsPathF;
        for(uint i = 0; i < pairsPath.length; i++) {
            pairsPathF[i] = IPair(pairsPath[i]);
        }
        uint256 amountBefore = 0;
        IERC20 from;
        uint256 inAm = amountIn;
        for(uint i = 0; i < pairsPath.length; i++) {
            IRouter router = getRouter(pairsPathF[i]);
            address address0 = pairsPathF[i].token0();
            address address1 = pairsPathF[i].token1();
            IERC20 token0 = IERC20(address0);
            IERC20 token1 = IERC20(address1);
            address[] memory t = new address[](2);
            if (stringsEquals(token0.symbol(),symbolPath[i])) {
                if(amountBefore == uint256(0)) {
                    amountBefore = token1.balanceOf(address(this));
                    from = token1;
                }
                token1.approve(address(router), inAm);
                t[0] = address1;
                t[1] = address0;
                inAm = router.swapExactTokensForTokens(inAm, 0, t, address(this), block.timestamp + 5 * 60 * 1000)[1];
            } else if(stringsEquals(token1.symbol(),symbolPath[i])) {
                if(amountBefore == uint256(0)) {
                    amountBefore = token0.balanceOf(address(this));
                    from = token0;
                }
                token0.approve(address(router), inAm);
                t[0] = address0;
                t[1] = address1;
                inAm = router.swapExactTokensForTokens(inAm, 0, t, address(this), block.timestamp + 5 * 60 * 1000)[1];
            } else {
                require(false, "Nevaliden symbol input");
            }
        }
        require(from.balanceOf(address(this)) > amountBefore, "Na zaguba sme");
    }

    function stringsEquals(string memory s1, string memory s2) private pure returns (bool) {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;
        if (l1 != b2.length) return false;
        for (uint256 i=0; i<l1; i++) {
            if (b1[i] != b2[i]) return false;
        }
        return true;
    }

    function getRouter(IPair pair) view private returns (IRouter) {
        address factoryAddress = pair.factory();
        if(factoryAddress == pangolinFactoryAddress) return IRouter(pangolinRouterAddress);
        if(factoryAddress == traderJoeFactoryAddress) return IRouter(traderJoeRouterAddress);
        if(factoryAddress == uniswapV2FactoryAddress) return IRouter(uniswapV2RouterAddress);
        require(false, "Ibasi");
    }
}