// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {Dookies} from "contracts/Dookies.sol";

contract DeployDookies is Script {
  address public constant TOKEN_ADDRESS = 0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D;

  function run() public {
    vm.startBroadcast();
    Dookies dookies = new Dookies({_dookiesToken: TOKEN_ADDRESS});
    console.log("Dookies Contract deployed at", address(dookies));
    vm.stopBroadcast();
  }
}
