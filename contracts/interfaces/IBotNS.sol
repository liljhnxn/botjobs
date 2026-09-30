// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBotNS
 * @notice Integration interface for BotNS (.bot naming service) on Botchain.
 * @dev Resolves wallet addresses to human-readable .bot names (e.g., alice.bot) and vice versa.
 */
interface IBotNS {
    /**
     * @notice Resolves a wallet address to its primary .bot name.
     * @param account The wallet address to resolve
     * @return name The primary .bot domain name (empty string if none configured)
     */
    function primaryName(address account) external view returns (string memory name);

    /**
     * @notice Resolves a .bot name to its associated wallet address.
     * @param name The .bot domain name
     * @return owner The resolved wallet address (address(0) if unregistered)
     */
    function resolve(string calldata name) external view returns (address owner);
}
