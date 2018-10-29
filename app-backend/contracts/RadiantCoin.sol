pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

/**
 * A basic token RE application
 */
contract RadiantCoin is MintableToken {
    string public constant name = "Radiant Coin";
    string public constant symbol = "RE";
    uint8  public constant decimals = 18;

    constructor(uint initialBalance) public {
        balances[msg.sender] = initialBalance;
        totalSupply_ = initialBalance;
    }
}
