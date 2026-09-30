// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBotEscrow
 * @notice Minimal integration interface for BotEscrow payment custody and milestone settlement on Botchain.
 * @dev BotJobs handles job discovery, applications, hiring workflow, and marketplace state.
 *      BotEscrow handles payment custody, milestones, releases, refunds, and disputes.
 */
interface IBotEscrow {
    enum EscrowStatus {
        NONE,
        LOCKED,
        RELEASED,
        REFUNDED,
        DISPUTED,
        CANCELLED
    }

    /**
     * @notice Queries whether an escrow agreement exists for a given BotJobs jobId.
     * @param jobId The unique job ID from BotJobs
     * @return exists True if an escrow agreement is registered for this job
     */
    function hasEscrowForJob(uint256 jobId) external view returns (bool exists);

    /**
     * @notice Returns the current status of the escrow agreement linked to a jobId.
     * @param jobId The unique job ID from BotJobs
     * @return status Current EscrowStatus
     */
    function getJobEscrowStatus(uint256 jobId) external view returns (EscrowStatus status);

    /**
     * @notice Returns the locked BOT amount and parties for a job's escrow agreement.
     * @param jobId The unique job ID from BotJobs
     * @return client The client address
     * @return freelancer The freelancer address
     * @return lockedAmount Total BOT locked in escrow
     * @return releasedAmount Total BOT released to freelancer
     */
    function getJobEscrowDetails(
        uint256 jobId
    )
        external
        view
        returns (
            address client,
            address freelancer,
            uint256 lockedAmount,
            uint256 releasedAmount
        );
}
