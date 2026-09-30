// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IBotRepute.sol";

/**
 * @title MockBotRepute
 * @notice Mock implementation of IBotRepute for automated testing of verified credentials.
 */
contract MockBotRepute is IBotRepute {
    mapping(address => Credential[]) private _userCredentials;

    event CredentialIssued(address indexed account, bytes32 credentialId, string roleType);

    function issueCredential(
        address account,
        string calldata roleType,
        string calldata metadataURI
    ) external returns (bytes32) {
        bytes32 credId = keccak256(abi.encodePacked(account, roleType, block.timestamp, _userCredentials[account].length));
        _userCredentials[account].push(
            Credential({
                credentialId: credId,
                roleType: roleType,
                issuer: msg.sender,
                issuedAt: uint64(block.timestamp),
                metadataURI: metadataURI,
                active: true
            })
        );
        emit CredentialIssued(account, credId, roleType);
        return credId;
    }

    function hasVerifiedCredential(
        address account,
        string calldata roleType
    ) external view override returns (bool hasRole) {
        Credential[] storage creds = _userCredentials[account];
        bytes32 targetHash = keccak256(bytes(roleType));
        for (uint256 i = 0; i < creds.length; i++) {
            if (creds[i].active && keccak256(bytes(creds[i].roleType)) == targetHash) {
                return true;
            }
        }
        return false;
    }

    function getCredentials(
        address account
    ) external view override returns (Credential[] memory credentials) {
        return _userCredentials[account];
    }
}
