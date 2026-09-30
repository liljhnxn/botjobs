// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IBotEscrow.sol";

/**
 * @title MockBotEscrow
 * @notice Mock implementation of IBotEscrow for automated testing of BotJobs escrow integration.
 */
contract MockBotEscrow is IBotEscrow {
    struct EscrowAgreement {
        address client;
        address freelancer;
        uint256 lockedAmount;
        uint256 releasedAmount;
        EscrowStatus status;
        bool exists;
    }

    mapping(uint256 => EscrowAgreement) private _agreements;

    event MockEscrowCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 amount);
    event MockEscrowStatusUpdated(uint256 indexed jobId, EscrowStatus status);

    function createEscrow(
        uint256 jobId,
        address client,
        address freelancer,
        uint256 amount
    ) external payable {
        _agreements[jobId] = EscrowAgreement({
            client: client,
            freelancer: freelancer,
            lockedAmount: amount,
            releasedAmount: 0,
            status: EscrowStatus.LOCKED,
            exists: true
        });
        emit MockEscrowCreated(jobId, client, freelancer, amount);
    }

    function setEscrowStatus(uint256 jobId, EscrowStatus status) external {
        require(_agreements[jobId].exists, "Escrow does not exist");
        _agreements[jobId].status = status;
        if (status == EscrowStatus.RELEASED) {
            _agreements[jobId].releasedAmount = _agreements[jobId].lockedAmount;
        }
        emit MockEscrowStatusUpdated(jobId, status);
    }

    function hasEscrowForJob(uint256 jobId) external view override returns (bool exists) {
        return _agreements[jobId].exists;
    }

    function getJobEscrowStatus(uint256 jobId) external view override returns (EscrowStatus status) {
        return _agreements[jobId].status;
    }

    function getJobEscrowDetails(
        uint256 jobId
    )
        external
        view
        override
        returns (
            address client,
            address freelancer,
            uint256 lockedAmount,
            uint256 releasedAmount
        )
    {
        EscrowAgreement storage ag = _agreements[jobId];
        return (ag.client, ag.freelancer, ag.lockedAmount, ag.releasedAmount);
    }
}
