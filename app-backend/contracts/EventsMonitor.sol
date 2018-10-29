pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';

/**
 * A basic monitor for RE events
 */
contract EventsMonitor is Ownable {

  address public token;
  address public burnAddress;

  event LogDownloadSuccess(
     address indexed user,
     address indexed reAdmin,
     address indexed token,
     address burnAddress,
     uint amount
  );

  event LogUploadSuccess(
     address indexed user,
     address indexed reAdmin
  );

  event LogViewSuccess(
    address indexed user,
    address indexed reAdmin
  );

  event LogAnalyzeSuccess(
     address indexed user,
     address indexed reAdmin,
     address indexed token,
     address burnAddress,
     uint amount
  );

  modifier tokensTransferable(address user, uint amount) {
    require(amount > 0);
    require(ERC20(token).allowance(user, this) >= amount);
    _;
  }

  constructor(address _token, address _burnAddress) public {
    token = _token;
    burnAddress = _burnAddress;
  }

  function download(address user, uint amount)
    public
    onlyOwner
    tokensTransferable(user, amount)
    returns (bool success)
  {
    ERC20(token).transferFrom(user, burnAddress, amount);

    emit LogDownloadSuccess(user, msg.sender, token, burnAddress, amount);
    return true;
  }

  function upload(address user)
    public
    onlyOwner
    returns (bool success)
  {
    emit LogUploadSuccess(user, msg.sender);
    return true;
  }

  function viewImage(address user)
    public
    onlyOwner
    returns (bool success)
  {
    emit LogViewSuccess(user, msg.sender);
    return true;
  }

  function analyze(address user, uint amount)
    public
    onlyOwner
    tokensTransferable(user, amount)
    returns (bool success)
  {
    ERC20(token).transferFrom.gas(450000)(user, burnAddress, amount);

    emit LogAnalyzeSuccess(user, msg.sender, token, burnAddress, amount);
    return true;
  }

}
