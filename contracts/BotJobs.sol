// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IBotEscrow.sol";
import "./interfaces/IBotRepute.sol";
import "./interfaces/IBotNS.sol";

/**
 * @title BotJobs
 * @notice Decentralized Web3 Jobs and Talent Marketplace on Botchain Mainnet.
 * @dev BotJobs handles job discovery, creation, applications, freelancer profiles, hiring workflow,
 *      and marketplace state. Payment custody, milestones, releases, refunds, and disputes are
 *      delegated to BotEscrow when configured. BotJobs never custodies job payment funds.
 */
contract BotJobs is AccessControl, Pausable, ReentrancyGuard {
    // ==================================================
    // ROLES
    // ==================================================
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ==================================================
    // INPUT LIMITS
    // ==================================================
    uint256 public constant MAX_TITLE_LENGTH = 120;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 4000;
    uint256 public constant MAX_PROPOSAL_LENGTH = 3000;
    uint256 public constant MAX_BIO_LENGTH = 1000;
    uint256 public constant MAX_HEADLINE_LENGTH = 150;
    uint256 public constant MAX_DISPLAY_NAME_LENGTH = 80;
    uint256 public constant MAX_SKILL_COUNT = 25;
    uint256 public constant MAX_SKILL_LENGTH = 50;
    uint256 public constant MAX_URI_LENGTH = 512;
    uint256 public constant DEFAULT_HIRE_CONFIRMATION_TIMEOUT = 3 days;

    // ==================================================
    // ENUMS
    // ==================================================
    enum JobStatus {
        OPEN,
        IN_REVIEW,
        HIRED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    enum ApplicationStatus {
        PENDING,
        SHORTLISTED,
        ACCEPTED,
        REJECTED,
        WITHDRAWN
    }

    // ==================================================
    // STRUCTS
    // ==================================================
    struct Job {
        uint256 jobId;
        address client;
        string title;
        string description;
        string metadataURI;
        bytes32 category;
        uint256 budget;
        uint256 createdAt;
        uint256 applicationDeadline;
        JobStatus status;
        address selectedFreelancer;
        uint256 applicationCount;
        uint256 hiredAt;
        uint256 completedAt;
    }

    struct Application {
        uint256 applicationId;
        uint256 jobId;
        address freelancer;
        string proposal;
        uint256 proposedBudget;
        uint256 estimatedDays;
        string portfolioURI;
        uint256 createdAt;
        ApplicationStatus status;
    }

    struct FreelancerProfile {
        address freelancer;
        string displayName;
        string headline;
        string bio;
        string[] skills;
        string portfolioURI;
        uint256 hourlyRate;
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
    }

    struct WorkHistoryEntry {
        uint256 jobId;
        string title;
        address client;
        address freelancer;
        uint256 budget;
        uint256 completedAt;
        bytes32 category;
    }

    // ==================================================
    // CUSTOM ERRORS
    // ==================================================
    error ZeroAddress();
    error InvalidJobId(uint256 jobId);
    error InvalidApplicationId(uint256 applicationId);
    error UnauthorizedCaller();
    error InvalidJobStatus(JobStatus current, JobStatus expected);
    error InvalidApplicationStatus(ApplicationStatus current, ApplicationStatus expected);
    error EmptyTitle();
    error TitleTooLong(uint256 length, uint256 max);
    error EmptyDescription();
    error DescriptionTooLong(uint256 length, uint256 max);
    error InvalidBudget();
    error InvalidDeadline();
    error DeadlinePassed();
    error URITooLong(uint256 length, uint256 max);
    error ClientCannotApplyToOwnJob();
    error DuplicateApplication();
    error EmptyProposal();
    error ProposalTooLong(uint256 length, uint256 max);
    error InvalidEstimatedDays();
    error EmptyDisplayName();
    error DisplayNameTooLong(uint256 length, uint256 max);
    error HeadlineTooLong(uint256 length, uint256 max);
    error BioTooLong(uint256 length, uint256 max);
    error TooManySkills(uint256 count, uint256 max);
    error InvalidSkillLength(uint256 length, uint256 max);
    error ProfileAlreadyExists();
    error ProfileNotFound();
    error HireConfirmationTimeoutNotElapsed(uint256 availableAt);
    error ActiveJobCancellationRequiresEscrowSettlement();
    error EscrowNotSettledForCompletion();
    error PaymentCustodyNotAllowed();

    // ==================================================
    // EVENTS
    // ==================================================
    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        string title,
        uint256 budget,
        uint256 applicationDeadline
    );
    event JobCancelled(uint256 indexed jobId, address indexed cancelledBy, JobStatus previousStatus);
    event ApplicationSubmitted(
        uint256 indexed applicationId,
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 proposedBudget,
        uint256 estimatedDays
    );
    event ApplicationWithdrawn(
        uint256 indexed applicationId,
        uint256 indexed jobId,
        address indexed freelancer
    );
    event ApplicationShortlisted(
        uint256 indexed applicationId,
        uint256 indexed jobId,
        address indexed freelancer
    );
    event ApplicationRejected(
        uint256 indexed applicationId,
        uint256 indexed jobId,
        address indexed freelancer
    );
    event FreelancerHired(
        uint256 indexed jobId,
        uint256 indexed applicationId,
        address indexed freelancer,
        address client
    );
    event HireConfirmed(uint256 indexed jobId, address indexed freelancer, address indexed client);
    event JobCompleted(
        uint256 indexed jobId,
        address indexed client,
        address indexed freelancer,
        uint256 budget,
        uint256 completedAt
    );
    event ProfileCreated(address indexed freelancer, string displayName, uint256 hourlyRate);
    event ProfileUpdated(address indexed freelancer, string displayName, uint256 hourlyRate);
    event ProfileDeactivated(address indexed freelancer);
    event EcosystemContractsUpdated(address botEscrow, address botRepute, address botNS);
    event HireConfirmationTimeoutUpdated(uint256 newTimeout);

    // ==================================================
    // STATE VARIABLES
    // ==================================================
    uint256 private _jobCounter;
    uint256 private _applicationCounter;
    uint256 public hireConfirmationTimeout;

    address public botEscrowAddress;
    address public botReputeAddress;
    address public botNSAddress;

    mapping(uint256 => Job) private _jobs;
    mapping(uint256 => Application) private _applications;

    mapping(uint256 => uint256[]) private _jobApplicationIds;
    mapping(uint256 => mapping(address => bool)) private _hasApplied;
    mapping(uint256 => mapping(address => uint256)) private _freelancerJobApplicationId;

    mapping(address => uint256[]) private _clientJobIds;
    mapping(address => uint256[]) private _freelancerJobIds;
    mapping(address => uint256[]) private _freelancerApplicationIds;
    mapping(bytes32 => uint256[]) private _categoryJobIds;

    mapping(address => FreelancerProfile) private _profiles;
    mapping(address => bool) private _hasProfile;
    address[] private _registeredFreelancers;

    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        address initialAdmin,
        address _botEscrow,
        address _botRepute,
        address _botNS
    ) {
        if (initialAdmin == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(PAUSER_ROLE, initialAdmin);

        botEscrowAddress = _botEscrow;
        botReputeAddress = _botRepute;
        botNSAddress = _botNS;
        hireConfirmationTimeout = DEFAULT_HIRE_CONFIRMATION_TIMEOUT;
    }

    /**
     * @notice BotJobs strictly prohibits direct native token deposits to prevent accidental fund custody.
     */
    receive() external payable {
        revert PaymentCustodyNotAllowed();
    }

    fallback() external payable {
        revert PaymentCustodyNotAllowed();
    }

    // ==================================================
    // ADMIN / PAUSE FUNCTIONS
    // ==================================================
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setEcosystemContracts(
        address _botEscrow,
        address _botRepute,
        address _botNS
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        botEscrowAddress = _botEscrow;
        botReputeAddress = _botRepute;
        botNSAddress = _botNS;
        emit EcosystemContractsUpdated(_botEscrow, _botRepute, _botNS);
    }

    function setHireConfirmationTimeout(
        uint256 _timeout
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_timeout >= 1 hours && _timeout <= 30 days, "Invalid timeout range");
        hireConfirmationTimeout = _timeout;
        emit HireConfirmationTimeoutUpdated(_timeout);
    }

    // ==================================================
    // 6. JOB CREATION
    // ==================================================
    function createJob(
        string calldata title,
        string calldata description,
        string calldata metadataURI,
        bytes32 category,
        uint256 budget,
        uint256 applicationDeadline
    ) external whenNotPaused nonReentrant returns (uint256 jobId) {
        uint256 titleLen = bytes(title).length;
        if (titleLen == 0) revert EmptyTitle();
        if (titleLen > MAX_TITLE_LENGTH) revert TitleTooLong(titleLen, MAX_TITLE_LENGTH);

        uint256 descLen = bytes(description).length;
        if (descLen == 0) revert EmptyDescription();
        if (descLen > MAX_DESCRIPTION_LENGTH) revert DescriptionTooLong(descLen, MAX_DESCRIPTION_LENGTH);

        uint256 uriLen = bytes(metadataURI).length;
        if (uriLen > MAX_URI_LENGTH) revert URITooLong(uriLen, MAX_URI_LENGTH);

        if (budget == 0) revert InvalidBudget();
        if (applicationDeadline <= block.timestamp) revert InvalidDeadline();

        _jobCounter++;
        jobId = _jobCounter;

        _jobs[jobId] = Job({
            jobId: jobId,
            client: msg.sender,
            title: title,
            description: description,
            metadataURI: metadataURI,
            category: category,
            budget: budget,
            createdAt: block.timestamp,
            applicationDeadline: applicationDeadline,
            status: JobStatus.OPEN,
            selectedFreelancer: address(0),
            applicationCount: 0,
            hiredAt: 0,
            completedAt: 0
        });

        _clientJobIds[msg.sender].push(jobId);
        _categoryJobIds[category].push(jobId);

        emit JobCreated(jobId, msg.sender, title, budget, applicationDeadline);
    }

    // ==================================================
    // 9. APPLY FOR JOB
    // ==================================================
    function applyForJob(
        uint256 jobId,
        string calldata proposal,
        uint256 proposedBudget,
        uint256 estimatedDays,
        string calldata portfolioURI
    ) external whenNotPaused nonReentrant returns (uint256 applicationId) {
        if (jobId == 0 || jobId > _jobCounter) revert InvalidJobId(jobId);
        Job storage job = _jobs[jobId];

        if (job.status != JobStatus.OPEN && job.status != JobStatus.IN_REVIEW) {
            revert InvalidJobStatus(job.status, JobStatus.OPEN);
        }
        if (block.timestamp > job.applicationDeadline) revert DeadlinePassed();
        if (msg.sender == job.client) revert ClientCannotApplyToOwnJob();
        if (_hasApplied[jobId][msg.sender]) revert DuplicateApplication();

        uint256 propLen = bytes(proposal).length;
        if (propLen == 0) revert EmptyProposal();
        if (propLen > MAX_PROPOSAL_LENGTH) revert ProposalTooLong(propLen, MAX_PROPOSAL_LENGTH);

        uint256 uriLen = bytes(portfolioURI).length;
        if (uriLen > MAX_URI_LENGTH) revert URITooLong(uriLen, MAX_URI_LENGTH);

        if (proposedBudget == 0) revert InvalidBudget();
        if (estimatedDays == 0) revert InvalidEstimatedDays();

        _applicationCounter++;
        applicationId = _applicationCounter;

        _applications[applicationId] = Application({
            applicationId: applicationId,
            jobId: jobId,
            freelancer: msg.sender,
            proposal: proposal,
            proposedBudget: proposedBudget,
            estimatedDays: estimatedDays,
            portfolioURI: portfolioURI,
            createdAt: block.timestamp,
            status: ApplicationStatus.PENDING
        });

        _hasApplied[jobId][msg.sender] = true;
        _freelancerJobApplicationId[jobId][msg.sender] = applicationId;
        _jobApplicationIds[jobId].push(applicationId);
        _freelancerApplicationIds[msg.sender].push(applicationId);
        job.applicationCount++;

        emit ApplicationSubmitted(applicationId, jobId, msg.sender, proposedBudget, estimatedDays);
    }

    // ==================================================
    // 10. WITHDRAW APPLICATION
    // ==================================================
    function withdrawApplication(
        uint256 applicationId
    ) external whenNotPaused nonReentrant {
        if (applicationId == 0 || applicationId > _applicationCounter) {
            revert InvalidApplicationId(applicationId);
        }
        Application storage app = _applications[applicationId];
        if (app.freelancer != msg.sender) revert UnauthorizedCaller();
        if (app.status != ApplicationStatus.PENDING) {
            revert InvalidApplicationStatus(app.status, ApplicationStatus.PENDING);
        }

        app.status = ApplicationStatus.WITHDRAWN;

        emit ApplicationWithdrawn(applicationId, app.jobId, msg.sender);
    }

    // ==================================================
    // 11. APPLICATION REVIEW
    // ==================================================
    function shortlistApplication(
        uint256 applicationId
    ) external whenNotPaused nonReentrant {
        if (applicationId == 0 || applicationId > _applicationCounter) {
            revert InvalidApplicationId(applicationId);
        }
        Application storage app = _applications[applicationId];
        Job storage job = _jobs[app.jobId];

        if (job.client != msg.sender) revert UnauthorizedCaller();
        if (job.status != JobStatus.OPEN && job.status != JobStatus.IN_REVIEW) {
            revert InvalidJobStatus(job.status, JobStatus.OPEN);
        }
        if (app.status != ApplicationStatus.PENDING) {
            revert InvalidApplicationStatus(app.status, ApplicationStatus.PENDING);
        }

        app.status = ApplicationStatus.SHORTLISTED;
        if (job.status == JobStatus.OPEN) {
            job.status = JobStatus.IN_REVIEW;
        }

        emit ApplicationShortlisted(applicationId, app.jobId, app.freelancer);
    }

    function rejectApplication(
        uint256 applicationId
    ) external whenNotPaused nonReentrant {
        if (applicationId == 0 || applicationId > _applicationCounter) {
            revert InvalidApplicationId(applicationId);
        }
        Application storage app = _applications[applicationId];
        Job storage job = _jobs[app.jobId];

        if (job.client != msg.sender) revert UnauthorizedCaller();
        if (job.status != JobStatus.OPEN && job.status != JobStatus.IN_REVIEW) {
            revert InvalidJobStatus(job.status, JobStatus.OPEN);
        }
        if (
            app.status != ApplicationStatus.PENDING &&
            app.status != ApplicationStatus.SHORTLISTED
        ) {
            revert InvalidApplicationStatus(app.status, ApplicationStatus.PENDING);
        }

        app.status = ApplicationStatus.REJECTED;

        emit ApplicationRejected(applicationId, app.jobId, app.freelancer);
    }

    function acceptApplication(
        uint256 applicationId
    ) external whenNotPaused nonReentrant {
        if (applicationId == 0 || applicationId > _applicationCounter) {
            revert InvalidApplicationId(applicationId);
        }
        Application storage app = _applications[applicationId];
        Job storage job = _jobs[app.jobId];

        if (job.client != msg.sender) revert UnauthorizedCaller();
        if (job.status != JobStatus.OPEN && job.status != JobStatus.IN_REVIEW) {
            revert InvalidJobStatus(job.status, JobStatus.OPEN);
        }
        if (
            app.status != ApplicationStatus.PENDING &&
            app.status != ApplicationStatus.SHORTLISTED
        ) {
            revert InvalidApplicationStatus(app.status, ApplicationStatus.PENDING);
        }

        app.status = ApplicationStatus.ACCEPTED;
        job.selectedFreelancer = app.freelancer;
        job.status = JobStatus.HIRED;
        job.hiredAt = block.timestamp;

        // Track freelancer job assignment if not already recorded
        uint256[] storage fJobs = _freelancerJobIds[app.freelancer];
        bool alreadyRecorded = false;
        for (uint256 i = 0; i < fJobs.length; i++) {
            if (fJobs[i] == job.jobId) {
                alreadyRecorded = true;
                break;
            }
        }
        if (!alreadyRecorded) {
            fJobs.push(job.jobId);
        }

        // Reject all other competing PENDING or SHORTLISTED applications for this job
        uint256[] storage appIds = _jobApplicationIds[job.jobId];
        for (uint256 i = 0; i < appIds.length; i++) {
            uint256 otherId = appIds[i];
            if (otherId != applicationId) {
                Application storage otherApp = _applications[otherId];
                if (
                    otherApp.status == ApplicationStatus.PENDING ||
                    otherApp.status == ApplicationStatus.SHORTLISTED
                ) {
                    otherApp.status = ApplicationStatus.REJECTED;
                    emit ApplicationRejected(otherId, job.jobId, otherApp.freelancer);
                }
            }
        }

        emit FreelancerHired(job.jobId, applicationId, app.freelancer, msg.sender);
    }

    // ==================================================
    // 12. HIRING WORKFLOW
    // ==================================================
    function confirmHire(uint256 jobId) external whenNotPaused nonReentrant {
        if (jobId == 0 || jobId > _jobCounter) revert InvalidJobId(jobId);
        Job storage job = _jobs[jobId];

        if (job.status != JobStatus.HIRED) {
            revert InvalidJobStatus(job.status, JobStatus.HIRED);
        }
        if (msg.sender != job.selectedFreelancer) revert UnauthorizedCaller();

        job.status = JobStatus.IN_PROGRESS;

        emit HireConfirmed(jobId, msg.sender, job.client);
    }

    /**
     * @notice Allows client to cancel an unconfirmed hire after hireConfirmationTimeout has elapsed,
     *         returning the job to OPEN status or cancelling it.
     */
    function cancelUnconfirmedHire(
        uint256 jobId,
        bool reopenJob
    ) external whenNotPaused nonReentrant {
        if (jobId == 0 || jobId > _jobCounter) revert InvalidJobId(jobId);
        Job storage job = _jobs[jobId];

        if (job.client != msg.sender) revert UnauthorizedCaller();
        if (job.status != JobStatus.HIRED) {
            revert InvalidJobStatus(job.status, JobStatus.HIRED);
        }
        uint256 availableAt = job.hiredAt + hireConfirmationTimeout;
        if (block.timestamp < availableAt) {
            revert HireConfirmationTimeoutNotElapsed(availableAt);
        }

        address previousFreelancer = job.selectedFreelancer;
        uint256 acceptedAppId = _freelancerJobApplicationId[jobId][previousFreelancer];
        if (acceptedAppId != 0) {
            _applications[acceptedAppId].status = ApplicationStatus.REJECTED;
        }

        job.selectedFreelancer = address(0);
        job.hiredAt = 0;

        if (reopenJob && block.timestamp < job.applicationDeadline) {
            job.status = JobStatus.OPEN;
        } else {
            job.status = JobStatus.CANCELLED;
            emit JobCancelled(jobId, msg.sender, JobStatus.HIRED);
        }
    }

    // ==================================================
    // 13. COMPLETION
    // ==================================================
    function markJobCompleted(uint256 jobId) external whenNotPaused nonReentrant {
        if (jobId == 0 || jobId > _jobCounter) revert InvalidJobId(jobId);
        Job storage job = _jobs[jobId];

        if (job.status != JobStatus.IN_PROGRESS) {
            revert InvalidJobStatus(job.status, JobStatus.IN_PROGRESS);
        }
        if (msg.sender != job.client) revert UnauthorizedCaller();

        // If BotEscrow is configured and an escrow exists for this job, verify it is not locked/disputed
        if (botEscrowAddress != address(0)) {
            IBotEscrow escrow = IBotEscrow(botEscrowAddress);
            if (escrow.hasEscrowForJob(jobId)) {
                IBotEscrow.EscrowStatus eStatus = escrow.getJobEscrowStatus(jobId);
                if (eStatus != IBotEscrow.EscrowStatus.RELEASED) {
                    revert EscrowNotSettledForCompletion();
                }
            }
        }

        job.status = JobStatus.COMPLETED;
        job.completedAt = block.timestamp;

        emit JobCompleted(
            jobId,
            job.client,
            job.selectedFreelancer,
            job.budget,
            block.timestamp
        );
    }

    // ==================================================
    // 14. JOB CANCELLATION
    // ==================================================
    function cancelJob(uint256 jobId) external whenNotPaused nonReentrant {
        if (jobId == 0 || jobId > _jobCounter) revert InvalidJobId(jobId);
        Job storage job = _jobs[jobId];

        if (job.client != msg.sender) revert UnauthorizedCaller();

        JobStatus currentStatus = job.status;
        if (currentStatus == JobStatus.COMPLETED || currentStatus == JobStatus.CANCELLED) {
            revert InvalidJobStatus(currentStatus, JobStatus.OPEN);
        }

        if (currentStatus == JobStatus.HIRED) {
            uint256 availableAt = job.hiredAt + hireConfirmationTimeout;
            if (block.timestamp < availableAt) {
                revert HireConfirmationTimeoutNotElapsed(availableAt);
            }
        } else if (currentStatus == JobStatus.IN_PROGRESS) {
            // Client cannot simply cancel an IN_PROGRESS job and bypass BotEscrow
            if (botEscrowAddress == address(0)) {
                revert ActiveJobCancellationRequiresEscrowSettlement();
            }
            IBotEscrow escrow = IBotEscrow(botEscrowAddress);
            if (!escrow.hasEscrowForJob(jobId)) {
                revert ActiveJobCancellationRequiresEscrowSettlement();
            }
            IBotEscrow.EscrowStatus eStatus = escrow.getJobEscrowStatus(jobId);
            if (
                eStatus != IBotEscrow.EscrowStatus.REFUNDED &&
                eStatus != IBotEscrow.EscrowStatus.CANCELLED
            ) {
                revert ActiveJobCancellationRequiresEscrowSettlement();
            }
        }

        job.status = JobStatus.CANCELLED;
        emit JobCancelled(jobId, msg.sender, currentStatus);
    }

    // ==================================================
    // 16. FREELANCER PROFILES
    // ==================================================
    function createProfile(
        string calldata displayName,
        string calldata headline,
        string calldata bio,
        string[] calldata skills,
        string calldata portfolioURI,
        uint256 hourlyRate
    ) external whenNotPaused nonReentrant {
        if (_hasProfile[msg.sender]) revert ProfileAlreadyExists();
        _validateProfileInputs(displayName, headline, bio, skills, portfolioURI);

        FreelancerProfile storage profile = _profiles[msg.sender];
        profile.freelancer = msg.sender;
        profile.displayName = displayName;
        profile.headline = headline;
        profile.bio = bio;
        profile.portfolioURI = portfolioURI;
        profile.hourlyRate = hourlyRate;
        profile.createdAt = block.timestamp;
        profile.updatedAt = block.timestamp;
        profile.active = true;

        for (uint256 i = 0; i < skills.length; i++) {
            profile.skills.push(skills[i]);
        }

        _hasProfile[msg.sender] = true;
        _registeredFreelancers.push(msg.sender);

        emit ProfileCreated(msg.sender, displayName, hourlyRate);
    }

    function updateProfile(
        string calldata displayName,
        string calldata headline,
        string calldata bio,
        string[] calldata skills,
        string calldata portfolioURI,
        uint256 hourlyRate,
        bool active
    ) external whenNotPaused nonReentrant {
        if (!_hasProfile[msg.sender]) revert ProfileNotFound();
        _validateProfileInputs(displayName, headline, bio, skills, portfolioURI);

        FreelancerProfile storage profile = _profiles[msg.sender];
        profile.displayName = displayName;
        profile.headline = headline;
        profile.bio = bio;
        profile.portfolioURI = portfolioURI;
        profile.hourlyRate = hourlyRate;
        profile.updatedAt = block.timestamp;
        profile.active = active;

        delete profile.skills;
        for (uint256 i = 0; i < skills.length; i++) {
            profile.skills.push(skills[i]);
        }

        emit ProfileUpdated(msg.sender, displayName, hourlyRate);
    }

    function deactivateProfile() external whenNotPaused nonReentrant {
        if (!_hasProfile[msg.sender]) revert ProfileNotFound();
        FreelancerProfile storage profile = _profiles[msg.sender];
        profile.active = false;
        profile.updatedAt = block.timestamp;

        emit ProfileDeactivated(msg.sender);
    }

    function _validateProfileInputs(
        string calldata displayName,
        string calldata headline,
        string calldata bio,
        string[] calldata skills,
        string calldata portfolioURI
    ) internal pure {
        uint256 nameLen = bytes(displayName).length;
        if (nameLen == 0) revert EmptyDisplayName();
        if (nameLen > MAX_DISPLAY_NAME_LENGTH) {
            revert DisplayNameTooLong(nameLen, MAX_DISPLAY_NAME_LENGTH);
        }

        uint256 headLen = bytes(headline).length;
        if (headLen > MAX_HEADLINE_LENGTH) {
            revert HeadlineTooLong(headLen, MAX_HEADLINE_LENGTH);
        }

        uint256 bioLen = bytes(bio).length;
        if (bioLen > MAX_BIO_LENGTH) {
            revert BioTooLong(bioLen, MAX_BIO_LENGTH);
        }

        uint256 uriLen = bytes(portfolioURI).length;
        if (uriLen > MAX_URI_LENGTH) {
            revert URITooLong(uriLen, MAX_URI_LENGTH);
        }

        if (skills.length > MAX_SKILL_COUNT) {
            revert TooManySkills(skills.length, MAX_SKILL_COUNT);
        }

        for (uint256 i = 0; i < skills.length; i++) {
            uint256 skillLen = bytes(skills[i]).length;
            if (skillLen == 0 || skillLen > MAX_SKILL_LENGTH) {
                revert InvalidSkillLength(skillLen, MAX_SKILL_LENGTH);
            }
        }
    }

    // ==================================================
    // 7. JOB BROWSING & READ FUNCTIONS
    // ==================================================
    function getJob(uint256 jobId) external view returns (Job memory) {
        if (jobId == 0 || jobId > _jobCounter) revert InvalidJobId(jobId);
        return _jobs[jobId];
    }

    function getJobCount() external view returns (uint256) {
        return _jobCounter;
    }

    function getApplicationCount() external view returns (uint256) {
        return _applicationCounter;
    }

    function getApplication(uint256 applicationId) external view returns (Application memory) {
        if (applicationId == 0 || applicationId > _applicationCounter) {
            revert InvalidApplicationId(applicationId);
        }
        return _applications[applicationId];
    }

    function getAllJobs() external view returns (Job[] memory) {
        Job[] memory jobs = new Job[](_jobCounter);
        for (uint256 i = 1; i <= _jobCounter; i++) {
            jobs[i - 1] = _jobs[i];
        }
        return jobs;
    }

    function getOpenJobs() external view returns (Job[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _jobCounter; i++) {
            if (_jobs[i].status == JobStatus.OPEN) {
                count++;
            }
        }

        Job[] memory openJobs = new Job[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _jobCounter; i++) {
            if (_jobs[i].status == JobStatus.OPEN) {
                openJobs[index] = _jobs[i];
                index++;
            }
        }
        return openJobs;
    }

    function getClientJobs(address client) external view returns (Job[] memory) {
        uint256[] storage jobIds = _clientJobIds[client];
        Job[] memory jobs = new Job[](jobIds.length);
        for (uint256 i = 0; i < jobIds.length; i++) {
            jobs[i] = _jobs[jobIds[i]];
        }
        return jobs;
    }

    function getFreelancerJobs(address freelancer) external view returns (Job[] memory) {
        uint256[] storage jobIds = _freelancerJobIds[freelancer];
        Job[] memory jobs = new Job[](jobIds.length);
        for (uint256 i = 0; i < jobIds.length; i++) {
            jobs[i] = _jobs[jobIds[i]];
        }
        return jobs;
    }

    function getJobsByCategory(bytes32 category) external view returns (Job[] memory) {
        uint256[] storage jobIds = _categoryJobIds[category];
        Job[] memory jobs = new Job[](jobIds.length);
        for (uint256 i = 0; i < jobIds.length; i++) {
            jobs[i] = _jobs[jobIds[i]];
        }
        return jobs;
    }

    function getJobApplications(uint256 jobId) external view returns (Application[] memory) {
        if (jobId == 0 || jobId > _jobCounter) revert InvalidJobId(jobId);
        uint256[] storage appIds = _jobApplicationIds[jobId];
        Application[] memory apps = new Application[](appIds.length);
        for (uint256 i = 0; i < appIds.length; i++) {
            apps[i] = _applications[appIds[i]];
        }
        return apps;
    }

    function getFreelancerApplications(
        address freelancer
    ) external view returns (Application[] memory) {
        uint256[] storage appIds = _freelancerApplicationIds[freelancer];
        Application[] memory apps = new Application[](appIds.length);
        for (uint256 i = 0; i < appIds.length; i++) {
            apps[i] = _applications[appIds[i]];
        }
        return apps;
    }

    function hasFreelancerApplied(
        uint256 jobId,
        address freelancer
    ) external view returns (bool) {
        return _hasApplied[jobId][freelancer];
    }

    function getProfile(
        address freelancer
    ) external view returns (FreelancerProfile memory) {
        return _profiles[freelancer];
    }

    function hasProfile(address freelancer) external view returns (bool) {
        return _hasProfile[freelancer];
    }

    function getAllProfiles() external view returns (FreelancerProfile[] memory) {
        FreelancerProfile[] memory list = new FreelancerProfile[](
            _registeredFreelancers.length
        );
        for (uint256 i = 0; i < _registeredFreelancers.length; i++) {
            list[i] = _profiles[_registeredFreelancers[i]];
        }
        return list;
    }

    // ==================================================
    // 20. WORK HISTORY READ FUNCTIONS
    // ==================================================
    function getCompletedJobsForFreelancer(
        address freelancer
    ) external view returns (WorkHistoryEntry[] memory) {
        uint256[] storage jobIds = _freelancerJobIds[freelancer];
        uint256 count = 0;
        for (uint256 i = 0; i < jobIds.length; i++) {
            Job storage job = _jobs[jobIds[i]];
            if (job.status == JobStatus.COMPLETED && job.selectedFreelancer == freelancer) {
                count++;
            }
        }

        WorkHistoryEntry[] memory history = new WorkHistoryEntry[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < jobIds.length; i++) {
            Job storage job = _jobs[jobIds[i]];
            if (job.status == JobStatus.COMPLETED && job.selectedFreelancer == freelancer) {
                history[idx] = WorkHistoryEntry({
                    jobId: job.jobId,
                    title: job.title,
                    client: job.client,
                    freelancer: job.selectedFreelancer,
                    budget: job.budget,
                    completedAt: job.completedAt,
                    category: job.category
                });
                idx++;
            }
        }
        return history;
    }

    function getCompletedJobsForClient(
        address client
    ) external view returns (WorkHistoryEntry[] memory) {
        uint256[] storage jobIds = _clientJobIds[client];
        uint256 count = 0;
        for (uint256 i = 0; i < jobIds.length; i++) {
            Job storage job = _jobs[jobIds[i]];
            if (job.status == JobStatus.COMPLETED) {
                count++;
            }
        }

        WorkHistoryEntry[] memory history = new WorkHistoryEntry[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < jobIds.length; i++) {
            Job storage job = _jobs[jobIds[i]];
            if (job.status == JobStatus.COMPLETED) {
                history[idx] = WorkHistoryEntry({
                    jobId: job.jobId,
                    title: job.title,
                    client: job.client,
                    freelancer: job.selectedFreelancer,
                    budget: job.budget,
                    completedAt: job.completedAt,
                    category: job.category
                });
                idx++;
            }
        }
        return history;
    }
}
