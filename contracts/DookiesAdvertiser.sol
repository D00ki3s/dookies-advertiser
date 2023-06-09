// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import SismoConnect Solidity library
import "sismo-connect-solidity/SismoLib.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ZKDropERC721
 * @author Sismo
 * @notice ZkDropERC721 is a contract that allows users to privately claim and transfer ERC721 tokens using SismoConnect.
 */
contract DookiesAdvertiser is
  ERC721,
  SismoConnect // the contract inherits from SismoConnect
{
  using SismoConnectHelper for SismoConnectVerifiedResult;
  // specify the groupIds from which users should be members of to claim the token
  bytes16 public immutable GROUP_ID;

  error RegularERC721TransferFromAreNotAllowed();
  error RegularERC721SafeTransferFromAreNotAllowed();

  constructor(
    string memory name,
    string memory symbol,
    bytes16 appId, // the appId of your sismoConnect app (you need to register your sismoConnect app on https://factory.sismo.io)
    bytes16 groupId // the groupId from which users should optionally be members of to claim the token
  ) ERC721(name, symbol) SismoConnect(appId) {
    GROUP_ID = groupId;
  }

  /**
   * @notice Claim a ERC721 on the address `to` thanks to a sismoConnect response containing a valid proof
   *         with respect to the auth,claims and message signature requests
   * @param response the sismoConnect response from the Data Vault app in bytes
   */
  function claimWithSismo(bytes memory response) public returns (uint256) {
    ClaimRequest[] memory claims = new ClaimRequest[](2);
    claims[0] = buildClaim({groupId: GROUP_ID});

    AuthRequest[] memory auths = new AuthRequest[](1);
    auths[0] = buildAuth({authType: AuthType.VAULT});

    SismoConnectRequest memory request = _requestBuilder.build({
      claims: claims,
      auths: auths,
      signature: buildSignature({message: abi.encode(msg.sender)}),
      appId: appId
    });

    // the verify function will check that the sismoConnectResponse proof is cryptographically valid
    // with respect to the auth, claims and message signature requests
    // i.e it checks that the user is the owner of a Sismo Data Vault
    // and that the user is a member of the groupId specified in the claim request
    // and that the message signature is valid
    SismoConnectVerifiedResult memory result = verify({responseBytes: response, request: request});

    // if the proof is valid, we mint the token to the address `to`
    // the tokenId is the anonymized userId of the user that claimed the token
    // if the user calls the claimWithSismo function multiple times
    // he will only be able to claim one token
    uint256 tokenId = result.getUserId(AuthType.VAULT);
    _mint(msg.sender, tokenId);

    return tokenId;
  }

  function transferFrom(address, address, uint256) public virtual override {
    revert RegularERC721TransferFromAreNotAllowed();
  }

  function safeTransferFrom(address, address, uint256) public virtual override {
    revert RegularERC721SafeTransferFromAreNotAllowed();
  }

  function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
    revert RegularERC721SafeTransferFromAreNotAllowed();
  }
}
