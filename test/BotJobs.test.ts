import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  BotJobs,
  MockBotEscrow,
  MockBotRepute,
  MockBotNS,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BotJobs Comprehensive Test Suite", function () {
  let botJobs: BotJobs;
  let mockEscrow: MockBotEscrow;
  let mockRepute: MockBotRepute;
  let mockNS: MockBotNS;

  let admin: HardhatEthersSigner;
  let client: HardhatEthersSigner;
  let freelancer1: HardhatEthersSigner;
  let freelancer2: HardhatEthersSigner;
  let outsider: HardhatEthersSigner;

  const CATEGORY_SMART_CONTRACTS = ethers.encodeBytes32String("Smart Contracts");
  const CATEGORY_FRONTEND = ethers.encodeBytes32String("Frontend");
  const BUDGET = ethers.parseEther("500"); // 500 BOT

  beforeEach(async function () {
    [admin, client, freelancer1, freelancer2, outsider] = await ethers.getSigners();

    const MockEscrowFactory = await ethers.getContractFactory("MockBotEscrow");
    mockEscrow = await MockEscrowFactory.deploy();
    await mockEscrow.waitForDeployment();

    const MockReputeFactory = await ethers.getContractFactory("MockBotRepute");
    mockRepute = await MockReputeFactory.deploy();
    await mockRepute.waitForDeployment();

    const MockNSFactory = await ethers.getContractFactory("MockBotNS");
    mockNS = await MockNSFactory.deploy();
    await mockNS.waitForDeployment();

    const BotJobsFactory = await ethers.getContractFactory("BotJobs");
    botJobs = await BotJobsFactory.deploy(
      admin.address,
      await mockEscrow.getAddress(),
      await mockRepute.getAddress(),
      await mockNS.getAddress()
    );
    await botJobs.waitForDeployment();
  });

  async function getFutureDeadline(daysAhead = 7): Promise<number> {
    const latest = await time.latest();
    return latest + daysAhead * 24 * 60 * 60;
  }

  // ==================================================
  // 1. DEPLOYMENT & INITIALIZATION
  // ==================================================
  describe("Deployment & Access Control", function () {
    it("reverts if initialAdmin is zero address", async function () {
      const BotJobsFactory = await ethers.getContractFactory("BotJobs");
      await expect(
        BotJobsFactory.deploy(
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(botJobs, "ZeroAddress");
    });

    it("correctly sets roles and ecosystem addresses", async function () {
      const defaultAdminRole = await botJobs.DEFAULT_ADMIN_ROLE();
      const pauserRole = await botJobs.PAUSER_ROLE();

      expect(await botJobs.hasRole(defaultAdminRole, admin.address)).to.be.true;
      expect(await botJobs.hasRole(pauserRole, admin.address)).to.be.true;
      expect(await botJobs.botEscrowAddress()).to.equal(await mockEscrow.getAddress());
      expect(await botJobs.botReputeAddress()).to.equal(await mockRepute.getAddress());
      expect(await botJobs.botNSAddress()).to.equal(await mockNS.getAddress());
    });

    it("rejects direct BOT transfers to prevent accidental fund custody", async function () {
      await expect(
        client.sendTransaction({
          to: await botJobs.getAddress(),
          value: ethers.parseEther("1.0"),
        })
      ).to.be.revertedWithCustomError(botJobs, "PaymentCustodyNotAllowed");
    });
  });

  // ==================================================
  // 2. JOB CREATION
  // ==================================================
  describe("Job Creation", function () {
    it("creates a valid job and emits JobCreated event", async function () {
      const deadline = await getFutureDeadline(7);
      await expect(
        botJobs
          .connect(client)
          .createJob(
            "Build DeFi Staking Vault",
            "Develop an audited ERC-4626 staking contract on Botchain.",
            "ipfs://QmJobMetadataHash",
            CATEGORY_SMART_CONTRACTS,
            BUDGET,
            deadline
          )
      )
        .to.emit(botJobs, "JobCreated")
        .withArgs(1n, client.address, "Build DeFi Staking Vault", BUDGET, deadline);

      expect(await botJobs.getJobCount()).to.equal(1n);
      const job = await botJobs.getJob(1n);
      expect(job.jobId).to.equal(1n);
      expect(job.client).to.equal(client.address);
      expect(job.title).to.equal("Build DeFi Staking Vault");
      expect(job.budget).to.equal(BUDGET);
      expect(job.status).to.equal(0n); // OPEN
      expect(job.selectedFreelancer).to.equal(ethers.ZeroAddress);
    });

    it("reverts when budget is zero", async function () {
      const deadline = await getFutureDeadline(7);
      await expect(
        botJobs
          .connect(client)
          .createJob(
            "Valid Title",
            "Valid Description",
            "",
            CATEGORY_SMART_CONTRACTS,
            0n,
            deadline
          )
      ).to.be.revertedWithCustomError(botJobs, "InvalidBudget");
    });

    it("reverts when title is empty", async function () {
      const deadline = await getFutureDeadline(7);
      await expect(
        botJobs
          .connect(client)
          .createJob("", "Valid Description", "", CATEGORY_SMART_CONTRACTS, BUDGET, deadline)
      ).to.be.revertedWithCustomError(botJobs, "EmptyTitle");
    });

    it("reverts when description is empty", async function () {
      const deadline = await getFutureDeadline(7);
      await expect(
        botJobs
          .connect(client)
          .createJob("Valid Title", "", "", CATEGORY_SMART_CONTRACTS, BUDGET, deadline)
      ).to.be.revertedWithCustomError(botJobs, "EmptyDescription");
    });

    it("reverts when application deadline is in the past", async function () {
      const pastDeadline = (await time.latest()) - 100;
      await expect(
        botJobs
          .connect(client)
          .createJob(
            "Valid Title",
            "Valid Description",
            "",
            CATEGORY_SMART_CONTRACTS,
            BUDGET,
            pastDeadline
          )
      ).to.be.revertedWithCustomError(botJobs, "InvalidDeadline");
    });

    it("reverts on oversized inputs", async function () {
      const deadline = await getFutureDeadline(7);
      const longTitle = "A".repeat(121);
      await expect(
        botJobs
          .connect(client)
          .createJob(
            longTitle,
            "Valid Description",
            "",
            CATEGORY_SMART_CONTRACTS,
            BUDGET,
            deadline
          )
      ).to.be.revertedWithCustomError(botJobs, "TitleTooLong");

      const longDesc = "B".repeat(4001);
      await expect(
        botJobs
          .connect(client)
          .createJob("Valid Title", longDesc, "", CATEGORY_SMART_CONTRACTS, BUDGET, deadline)
      ).to.be.revertedWithCustomError(botJobs, "DescriptionTooLong");

      const longURI = "C".repeat(513);
      await expect(
        botJobs
          .connect(client)
          .createJob(
            "Valid Title",
            "Valid Description",
            longURI,
            CATEGORY_SMART_CONTRACTS,
            BUDGET,
            deadline
          )
      ).to.be.revertedWithCustomError(botJobs, "URITooLong");
    });

    it("supports job browsing queries (getOpenJobs, getClientJobs, getJobsByCategory)", async function () {
      const deadline = await getFutureDeadline(7);
      await botJobs
        .connect(client)
        .createJob("Job 1", "Desc 1", "", CATEGORY_SMART_CONTRACTS, BUDGET, deadline);
      await botJobs
        .connect(client)
        .createJob("Job 2", "Desc 2", "", CATEGORY_FRONTEND, BUDGET, deadline);

      const openJobs = await botJobs.getOpenJobs();
      expect(openJobs.length).to.equal(2);

      const clientJobs = await botJobs.getClientJobs(client.address);
      expect(clientJobs.length).to.equal(2);

      const scJobs = await botJobs.getJobsByCategory(CATEGORY_SMART_CONTRACTS);
      expect(scJobs.length).to.equal(1);
      expect(scJobs[0].title).to.equal("Job 1");
    });
  });

  // ==================================================
  // 3. APPLICATIONS
  // ==================================================
  describe("Job Applications", function () {
    let jobId: bigint;
    let deadline: number;

    beforeEach(async function () {
      deadline = await getFutureDeadline(7);
      await botJobs
        .connect(client)
        .createJob(
          "Solidity Engineer Needed",
          "Build core marketplace contracts.",
          "",
          CATEGORY_SMART_CONTRACTS,
          BUDGET,
          deadline
        );
      jobId = 1n;
    });

    it("allows a freelancer to submit a valid application", async function () {
      const proposedBudget = ethers.parseEther("480");
      await expect(
        botJobs
          .connect(freelancer1)
          .applyForJob(
            jobId,
            "I have 5 years of Solidity experience.",
            proposedBudget,
            14n,
            "https://github.com/freelancer1"
          )
      )
        .to.emit(botJobs, "ApplicationSubmitted")
        .withArgs(1n, jobId, freelancer1.address, proposedBudget, 14n);

      const apps = await botJobs.getJobApplications(jobId);
      expect(apps.length).to.equal(1);
      expect(apps[0].freelancer).to.equal(freelancer1.address);
      expect(apps[0].proposedBudget).to.equal(proposedBudget);
      expect(apps[0].status).to.equal(0n); // PENDING
    });

    it("prevents duplicate applications from the same freelancer", async function () {
      await botJobs
        .connect(freelancer1)
        .applyForJob(jobId, "First proposal", BUDGET, 10n, "");

      await expect(
        botJobs
          .connect(freelancer1)
          .applyForJob(jobId, "Second proposal", BUDGET, 10n, "")
      ).to.be.revertedWithCustomError(botJobs, "DuplicateApplication");
    });

    it("prevents applying after the application deadline", async function () {
      await time.increaseTo(deadline + 10);
      await expect(
        botJobs
          .connect(freelancer1)
          .applyForJob(jobId, "Late proposal", BUDGET, 10n, "")
      ).to.be.revertedWithCustomError(botJobs, "DeadlinePassed");
    });

    it("prevents client from applying to their own job", async function () {
      await expect(
        botJobs
          .connect(client)
          .applyForJob(jobId, "Applying to my own job", BUDGET, 10n, "")
      ).to.be.revertedWithCustomError(botJobs, "ClientCannotApplyToOwnJob");
    });

    it("reverts on empty proposal, zero budget, or zero estimated days", async function () {
      await expect(
        botJobs.connect(freelancer1).applyForJob(jobId, "", BUDGET, 10n, "")
      ).to.be.revertedWithCustomError(botJobs, "EmptyProposal");

      await expect(
        botJobs.connect(freelancer1).applyForJob(jobId, "Valid", 0n, 10n, "")
      ).to.be.revertedWithCustomError(botJobs, "InvalidBudget");

      await expect(
        botJobs.connect(freelancer1).applyForJob(jobId, "Valid", BUDGET, 0n, "")
      ).to.be.revertedWithCustomError(botJobs, "InvalidEstimatedDays");
    });

    it("allows applicant to withdraw a PENDING application and blocks unauthorized withdrawal", async function () {
      await botJobs
        .connect(freelancer1)
        .applyForJob(jobId, "Proposal text", BUDGET, 10n, "");

      await expect(
        botJobs.connect(outsider).withdrawApplication(1n)
      ).to.be.revertedWithCustomError(botJobs, "UnauthorizedCaller");

      await expect(botJobs.connect(freelancer1).withdrawApplication(1n))
        .to.emit(botJobs, "ApplicationWithdrawn")
        .withArgs(1n, jobId, freelancer1.address);

      const app = await botJobs.getApplication(1n);
      expect(app.status).to.equal(4n); // WITHDRAWN
    });
  });

  // ==================================================
  // 4. HIRING WORKFLOW
  // ==================================================
  describe("Hiring Workflow", function () {
    let jobId: bigint;

    beforeEach(async function () {
      const deadline = await getFutureDeadline(7);
      await botJobs
        .connect(client)
        .createJob(
          "Full-Stack Web3 App",
          "Build frontend and smart contracts.",
          "",
          CATEGORY_SMART_CONTRACTS,
          BUDGET,
          deadline
        );
      jobId = 1n;

      await botJobs
        .connect(freelancer1)
        .applyForJob(jobId, "Proposal from Freelancer 1", BUDGET, 10n, "");
      await botJobs
        .connect(freelancer2)
        .applyForJob(jobId, "Proposal from Freelancer 2", BUDGET, 12n, "");
    });

    it("allows client to shortlist, reject, and accept applications", async function () {
      await expect(botJobs.connect(client).shortlistApplication(1n))
        .to.emit(botJobs, "ApplicationShortlisted")
        .withArgs(1n, jobId, freelancer1.address);

      let job = await botJobs.getJob(jobId);
      expect(job.status).to.equal(1n); // IN_REVIEW

      await expect(botJobs.connect(client).acceptApplication(1n))
        .to.emit(botJobs, "FreelancerHired")
        .withArgs(jobId, 1n, freelancer1.address, client.address);

      job = await botJobs.getJob(jobId);
      expect(job.status).to.equal(2n); // HIRED
      expect(job.selectedFreelancer).to.equal(freelancer1.address);

      // Competing application (2n) should be automatically rejected
      const app2 = await botJobs.getApplication(2n);
      expect(app2.status).to.equal(3n); // REJECTED
    });

    it("blocks unauthorized users from accepting or rejecting applications", async function () {
      await expect(
        botJobs.connect(outsider).acceptApplication(1n)
      ).to.be.revertedWithCustomError(botJobs, "UnauthorizedCaller");

      await expect(
        botJobs.connect(outsider).rejectApplication(1n)
      ).to.be.revertedWithCustomError(botJobs, "UnauthorizedCaller");
    });

    it("prevents accepting a rejected application or double hiring", async function () {
      await botJobs.connect(client).rejectApplication(1n);

      await expect(
        botJobs.connect(client).acceptApplication(1n)
      ).to.be.revertedWithCustomError(botJobs, "InvalidApplicationStatus");

      await botJobs.connect(client).acceptApplication(2n);

      await expect(
        botJobs.connect(client).acceptApplication(2n)
      ).to.be.revertedWithCustomError(botJobs, "InvalidJobStatus");
    });

    it("allows only selected freelancer to confirmHire and transition HIRED -> IN_PROGRESS", async function () {
      await botJobs.connect(client).acceptApplication(1n);

      await expect(
        botJobs.connect(freelancer2).confirmHire(jobId)
      ).to.be.revertedWithCustomError(botJobs, "UnauthorizedCaller");

      await expect(botJobs.connect(freelancer1).confirmHire(jobId))
        .to.emit(botJobs, "HireConfirmed")
        .withArgs(jobId, freelancer1.address, client.address);

      const job = await botJobs.getJob(jobId);
      expect(job.status).to.equal(3n); // IN_PROGRESS
    });

    it("allows client to cancel unconfirmed hire after timeout", async function () {
      await botJobs.connect(client).acceptApplication(1n);

      await expect(
        botJobs.connect(client).cancelUnconfirmedHire(jobId, true)
      ).to.be.revertedWithCustomError(botJobs, "HireConfirmationTimeoutNotElapsed");

      await time.increase(3 * 24 * 60 * 60 + 10);

      await botJobs.connect(client).cancelUnconfirmedHire(jobId, true);
      const job = await botJobs.getJob(jobId);
      expect(job.status).to.equal(0n); // Reopened to OPEN
      expect(job.selectedFreelancer).to.equal(ethers.ZeroAddress);
    });
  });

  // ==================================================
  // 5. JOB COMPLETION & CANCELLATION & BOTESCROW
  // ==================================================
  describe("Job Completion, Cancellation & BotEscrow Integration", function () {
    let jobId: bigint;

    beforeEach(async function () {
      const deadline = await getFutureDeadline(7);
      await botJobs
        .connect(client)
        .createJob(
          "Smart Contract Audit",
          "Review our staking contracts.",
          "",
          CATEGORY_SMART_CONTRACTS,
          BUDGET,
          deadline
        );
      jobId = 1n;
      await botJobs
        .connect(freelancer1)
        .applyForJob(jobId, "Ready to audit", BUDGET, 5n, "");
    });

    it("completes job when IN_PROGRESS and records work history", async function () {
      await botJobs.connect(client).acceptApplication(1n);
      await botJobs.connect(freelancer1).confirmHire(jobId);

      // Unauthorized completion blocked
      await expect(
        botJobs.connect(freelancer1).markJobCompleted(jobId)
      ).to.be.revertedWithCustomError(botJobs, "UnauthorizedCaller");

      await expect(botJobs.connect(client).markJobCompleted(jobId)).to.emit(
        botJobs,
        "JobCompleted"
      );

      const job = await botJobs.getJob(jobId);
      expect(job.status).to.equal(4n); // COMPLETED

      // Prevent double completion
      await expect(
        botJobs.connect(client).markJobCompleted(jobId)
      ).to.be.revertedWithCustomError(botJobs, "InvalidJobStatus");

      // Verify on-chain work history
      const fHistory = await botJobs.getCompletedJobsForFreelancer(freelancer1.address);
      expect(fHistory.length).to.equal(1);
      expect(fHistory[0].title).to.equal("Smart Contract Audit");
      expect(fHistory[0].budget).to.equal(BUDGET);

      const cHistory = await botJobs.getCompletedJobsForClient(client.address);
      expect(cHistory.length).to.equal(1);
      expect(cHistory[0].freelancer).to.equal(freelancer1.address);
    });

    it("enforces BotEscrow release status before completion when escrow agreement exists", async function () {
      await botJobs.connect(client).acceptApplication(1n);
      await botJobs.connect(freelancer1).confirmHire(jobId);

      await mockEscrow
        .connect(client)
        .createEscrow(jobId, client.address, freelancer1.address, BUDGET);

      // Escrow is LOCKED -> markJobCompleted should revert
      await expect(
        botJobs.connect(client).markJobCompleted(jobId)
      ).to.be.revertedWithCustomError(botJobs, "EscrowNotSettledForCompletion");

      // Release escrow
      await mockEscrow.setEscrowStatus(jobId, 2); // RELEASED

      await expect(botJobs.connect(client).markJobCompleted(jobId)).to.emit(
        botJobs,
        "JobCompleted"
      );
    });

    it("allows client to cancel an OPEN job, blocks unauthorized or active job bypass", async function () {
      await expect(
        botJobs.connect(outsider).cancelJob(jobId)
      ).to.be.revertedWithCustomError(botJobs, "UnauthorizedCaller");

      await expect(botJobs.connect(client).cancelJob(jobId))
        .to.emit(botJobs, "JobCancelled")
        .withArgs(jobId, client.address, 0n);

      const job = await botJobs.getJob(jobId);
      expect(job.status).to.equal(5n); // CANCELLED
    });

    it("blocks client from unilaterally cancelling IN_PROGRESS job without BotEscrow refund/cancellation", async function () {
      await botJobs.connect(client).acceptApplication(1n);
      await botJobs.connect(freelancer1).confirmHire(jobId);

      // Without escrow agreement settled, cannot cancel IN_PROGRESS job
      await expect(
        botJobs.connect(client).cancelJob(jobId)
      ).to.be.revertedWithCustomError(
        botJobs,
        "ActiveJobCancellationRequiresEscrowSettlement"
      );

      // Create locked escrow -> still cannot cancel
      await mockEscrow
        .connect(client)
        .createEscrow(jobId, client.address, freelancer1.address, BUDGET);

      await expect(
        botJobs.connect(client).cancelJob(jobId)
      ).to.be.revertedWithCustomError(
        botJobs,
        "ActiveJobCancellationRequiresEscrowSettlement"
      );

      // Once BotEscrow settles as REFUNDED (3), client can record cancellation
      await mockEscrow.setEscrowStatus(jobId, 3); // REFUNDED
      await expect(botJobs.connect(client).cancelJob(jobId)).to.emit(
        botJobs,
        "JobCancelled"
      );
    });
  });

  // ==================================================
  // 6. FREELANCER PROFILES
  // ==================================================
  describe("Freelancer Profiles", function () {
    it("creates, updates, deactivates, and retrieves freelancer profile", async function () {
      const rate = ethers.parseEther("50");
      await expect(
        botJobs
          .connect(freelancer1)
          .createProfile(
            "Alice Builder",
            "Senior Solidity & Next.js Engineer",
            "Building decentralized apps on Botchain.",
            ["Solidity", "TypeScript", "Next.js", "Web3"],
            "https://alice.dev",
            rate
          )
      )
        .to.emit(botJobs, "ProfileCreated")
        .withArgs(freelancer1.address, "Alice Builder", rate);

      expect(await botJobs.hasProfile(freelancer1.address)).to.be.true;

      let profile = await botJobs.getProfile(freelancer1.address);
      expect(profile.displayName).to.equal("Alice Builder");
      expect(profile.skills.length).to.equal(4);
      expect(profile.active).to.be.true;

      // Prevent duplicate profile creation
      await expect(
        botJobs
          .connect(freelancer1)
          .createProfile("Alice 2", "Headline", "Bio", ["Solidity"], "", rate)
      ).to.be.revertedWithCustomError(botJobs, "ProfileAlreadyExists");

      // Update profile
      const newRate = ethers.parseEther("75");
      await expect(
        botJobs
          .connect(freelancer1)
          .updateProfile(
            "Alice Web3 Architect",
            "Lead Protocol Engineer",
            "Updated bio content",
            ["Solidity", "Smart Contracts"],
            "https://alice.xyz",
            newRate,
            true
          )
      )
        .to.emit(botJobs, "ProfileUpdated")
        .withArgs(freelancer1.address, "Alice Web3 Architect", newRate);

      profile = await botJobs.getProfile(freelancer1.address);
      expect(profile.displayName).to.equal("Alice Web3 Architect");
      expect(profile.skills.length).to.equal(2);

      // Deactivate profile
      await expect(botJobs.connect(freelancer1).deactivateProfile())
        .to.emit(botJobs, "ProfileDeactivated")
        .withArgs(freelancer1.address);

      profile = await botJobs.getProfile(freelancer1.address);
      expect(profile.active).to.be.false;
    });

    it("validates profile input constraints", async function () {
      const rate = ethers.parseEther("40");
      await expect(
        botJobs
          .connect(freelancer2)
          .createProfile("", "Headline", "Bio", ["Solidity"], "", rate)
      ).to.be.revertedWithCustomError(botJobs, "EmptyDisplayName");

      const tooManySkills = Array.from({ length: 26 }, (_, i) => `Skill${i}`);
      await expect(
        botJobs
          .connect(freelancer2)
          .createProfile("Bob", "Headline", "Bio", tooManySkills, "", rate)
      ).to.be.revertedWithCustomError(botJobs, "TooManySkills");
    });
  });

  // ==================================================
  // 7. PAUSABLE & INTEGRATION MOCKS
  // ==================================================
  describe("Security (Pausable) & Ecosystem Integration Mocks", function () {
    it("blocks state-changing operations when paused and allows admin to unpause", async function () {
      await expect(
        botJobs.connect(outsider).pause()
      ).to.be.revertedWithCustomError(botJobs, "AccessControlUnauthorizedAccount");

      await botJobs.connect(admin).pause();

      const deadline = await getFutureDeadline(7);
      await expect(
        botJobs
          .connect(client)
          .createJob("Paused Job", "Desc", "", CATEGORY_FRONTEND, BUDGET, deadline)
      ).to.be.revertedWithCustomError(botJobs, "EnforcedPause");

      await botJobs.connect(admin).unpause();
      await expect(
        botJobs
          .connect(client)
          .createJob("Active Job", "Desc", "", CATEGORY_FRONTEND, BUDGET, deadline)
      ).to.emit(botJobs, "JobCreated");
    });

    it("verifies MockBotRepute and MockBotNS interfaces work as expected", async function () {
      await mockRepute.issueCredential(
        freelancer1.address,
        "Builder",
        "ipfs://QmCred1"
      );
      expect(
        await mockRepute.hasVerifiedCredential(freelancer1.address, "Builder")
      ).to.be.true;
      const creds = await mockRepute.getCredentials(freelancer1.address);
      expect(creds.length).to.equal(1);
      expect(creds[0].roleType).to.equal("Builder");

      await mockNS.register(freelancer1.address, "alice.bot");
      expect(await mockNS.primaryName(freelancer1.address)).to.equal("alice.bot");
      expect(await mockNS.resolve("alice.bot")).to.equal(freelancer1.address);
    });
  });
});
