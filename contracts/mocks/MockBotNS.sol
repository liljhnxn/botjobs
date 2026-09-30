// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IBotNS.sol";

/**
 * @title MockBotNS
 * @notice Mock implementation of IBotNS for automated testing of .bot domain resolution.
 */
contract MockBotNS is IBotNS {
    mapping(address => string) private _primaryNames;
    mapping(bytes32 => address) private _nameToAddress;

    event NameRegistered(address indexed owner, string name);

    function register(address account, string calldata name) external {
        _primaryNames[account] = name;
        _nameToAddress[keccak256(bytes(name))] = account;
        emit NameRegistered(account, name);
    }

    function primaryName(address account) external view override returns (string memory name) {
        return _primaryNames[account];
    }

    function resolve(string calldata name) external view override returns (address owner) {
        return _nameToAddress[keccak256(bytes(name))];
    }
}
