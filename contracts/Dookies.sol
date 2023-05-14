// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Dookies - Privacy Preserving Advertisement Infra
/// @author Jamshed Cooper & Dookies team

contract Dookies {
  using SafeERC20 for IERC20;
  /// @dev Variables required for AddCampaign
  address public dookiesToken;
  bool public isBookingOpen;
  address public owner;

  /// @dev AdCampaign and list of AdCampaigns
  struct AdCampaign {
    string name; //name of ad
    address owner; //wallet of owner
    string adCreative; //IPFS link
    uint256 storedValue; //Amount of GHO use is willing to spend
    bool paused; //Is contract paused/OFF or ON
    //string targetAudience; //A , seperated list of tags for ad matching engine
    //uint256 freqAds; //frequency of ads shown per user per day
    //string timezone; //A , seperated list of timezones when the ad is displayed
  }
  AdCampaign[] public adList;
  mapping(address => AdCampaign) public adLookup;

  /// @dev List of Valid publishers and mapping of Ads and Publishers
  address[] public publisherList;
  mapping(address => AdCampaign) public publisherToAd;

  /// @notice Modifiers - Ensure onlyByOwner
  modifier onlyByOwner() {
    require(msg.sender == owner, "owner can only call");
    _;
  }

  /// @dev Create and Deploy contract
  /// @dev Called by the Owner of the Rayze Restaurant Network

  constructor(address _dookiesToken) {
    dookiesToken = _dookiesToken;
    isBookingOpen = false;
    owner = msg.sender;
  }

  function getAllAdCampaigns() public view returns (AdCampaign[] memory) {
    return adList;
  }

  /// @dev register the AdCampaign --needs to be called by Advertiser wallet
  /// @dev will be called to create a new Ad Campaign
  function registerAdCampaign(
    string memory _name, //name of ad
    string memory _adCreative, //IPFS link
    uint256 _amount
  ) public {
    AdCampaign memory newAd = AdCampaign({
      name: _name,
      owner: msg.sender,
      adCreative: _adCreative,
      storedValue: _amount,
      paused: false
    });
    adList.push(newAd);
    adLookup[owner] = newAd;

    IERC20(dookiesToken).safeTransferFrom(msg.sender, address(this), _amount);
  }

  /// @dev will be called by Dookie to transfer fund from Adv to Publisher.
  ///Need to PAY FIRST before displaying the ad.
  function payPublisher(
    address _advertiser,
    address _publisher,
    uint256 _priceForAd
  ) public onlyByOwner {
    require(adLookup[_advertiser].paused == true, "advtr not found");
    require(_priceForAd > adLookup[_advertiser].storedValue, "not enough stor value");
    IERC20(dookiesToken).safeTransferFrom(address(this), _publisher, _priceForAd);
    adLookup[_advertiser].storedValue -= _priceForAd;
  }

  /// @dev set booking of Ads open/closed
  function setBookingOpen(bool _isBookingOpen) public onlyByOwner {
    isBookingOpen = _isBookingOpen;
  }

  function getAdsForAddress(address _owner) public view returns (AdCampaign[] memory) {
    uint256 adCount = 0;
    for (uint256 i = 0; i < adList.length; i++) {
      if (adList[i].owner == _owner) {
        adCount++;
      }
    }
    AdCampaign[] memory ads = new AdCampaign[](adCount);
    uint256 index = 0;
    for (uint256 i = 0; i < adList.length; i++) {
      if (adList[i].owner == _owner) {
        ads[index] = adList[i];
        index++;
      }
    }
    return ads;
  }
}
