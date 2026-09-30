// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBotRepute
 * @notice Optional integration interface for reading verified on-chain credentials from BotRepute.
 * @dev BotJobs does NOT fabricate reputation scores. It reads verified credentials when BotRepute is configured.
 */
interface IBotRepute {
    struct Credential {
        bytes32 credentialId;
        string roleType; // e.g., "Developer", "Builder", "Contributor", "Creator", "Project Contributor"
        address issuer;
        uint64 issuedAt;
        string metadataURI;
        bool active;
    }

    /**
     * @notice Checks if an account holds an active verified credential of a specific role type.
     * @param account Wallet address of the user
     * @param roleType Role name (e.g. "Builder", "Project Contributor")
     * @return hasRole True if verified and active
     */
    function hasVerifiedCredential(
        address account,
        string calldata roleType
    ) external view returns (bool hasRole);

    /**
     * @notice Retrieves all verified credentials for an account.
     * @param account Wallet address of the user
     * @return credentials Array of Credential structs
     */
    function getCredentials(
        address account
    ) external view returns (Credential[] memory credentials);
}
