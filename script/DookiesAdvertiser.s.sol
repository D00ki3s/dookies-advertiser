// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {DookiesAdvertiser} from "contracts/DookiesAdvertiser.sol";

contract DeployDookiesAdvertiser is Script {
  bytes16 public constant APP_ID = 0xe54de325f698842c8c54238f273cf5f1;
  bytes16 public constant GROUP_ID = 0x311ece950f9ec55757eb95f3182ae5e2;

  function run() public {
    vm.startBroadcast();
    DookiesAdvertiser dookieAdvertiser = new DookiesAdvertiser({
      name: "Dookies Advertiser Connect Contract",
      symbol: "DOOK",
      appId: APP_ID,
      groupId: GROUP_ID
    });
    console.log("DookiesAdvertiser Contract deployed at", address(dookieAdvertiser));
    vm.stopBroadcast();
  }
}
