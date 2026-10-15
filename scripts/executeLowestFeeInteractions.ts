import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;
  const contractAddress = process.env.BOTJOBS_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("BOTJOBS_CONTRACT_ADDRESS must be set in your .env file.");
  }
  const botJobs = await ethers.getContractAt("BotJobs", contractAddress, deployer);

  console.log("==================================================");
  console.log("Executing 5 Contract Interactions across 3 Addresses");
  console.log("==================================================");
  console.log(`Contract Address     : ${contractAddress}`);
  console.log(`Address 1 (Deployer) : ${deployer.address}`);

  const startBal = await provider.getBalance(deployer.address);
  console.log(`Starting Balance     : ${ethers.formatEther(startBal)} BOT`);

  const gasPrice = ethers.parseUnits("20", "gwei");
  const PAUSER_ROLE = await botJobs.PAUSER_ROLE();

  // Create Wallet 2 and Wallet 3 with deterministic entropy or saved keys
  const wallet2 = ethers.Wallet.createRandom().connect(provider);
  const wallet3 = ethers.Wallet.createRandom().connect(provider);
  console.log(`Address 2            : ${wallet2.address}`);
  console.log(`Address 3            : ${wallet3.address}`);

  // Record Interaction 1 (Already confirmed)
  const tx1Hash = "0x7371443e68e4c0696d8f72f484d0cdfe63dbbc144df918fcab630bad48d73b0c";
  console.log("\n[Interaction 1/5] - Address 1 (Deployer): createJob");
  console.log(`Tx 1: https://scan.botchain.ai/tx/${tx1Hash} (CONFIRMED)`);

  // Fund Wallet 2 with 0.0013 BOT (enough for pause() @ 48k gas + safety buffer)
  console.log("\n--- Funding Address 2 with 0.0013 BOT ---");
  const fund2 = await deployer.sendTransaction({
    to: wallet2.address,
    value: ethers.parseEther("0.0013"),
    gasPrice: gasPrice
  });
  console.log(`Fund 2 Tx: https://scan.botchain.ai/tx/${fund2.hash}`);
  await fund2.wait();

  // Interaction 2: Address 1 grants PAUSER_ROLE to Address 2
  console.log("\n[Interaction 2/5] - Address 1 (Deployer): grantRole(PAUSER_ROLE, Address 2)");
  const tx2 = await botJobs.grantRole(PAUSER_ROLE, wallet2.address, { gasPrice: gasPrice });
  console.log(`Tx 2: https://scan.botchain.ai/tx/${tx2.hash}`);
  const rec2 = await tx2.wait();
  console.log(`Tx 2 Confirmed! Gas used: ${rec2?.gasUsed.toString()}`);

  // Interaction 3: Address 2 calls pause()
  console.log("\n[Interaction 3/5] - Address 2: pause()");
  const botJobsWallet2 = botJobs.connect(wallet2);
  const tx3 = await botJobsWallet2.pause({ gasPrice: gasPrice });
  console.log(`Tx 3: https://scan.botchain.ai/tx/${tx3.hash}`);
  const rec3 = await tx3.wait();
  console.log(`Tx 3 Confirmed! Gas used: ${rec3?.gasUsed.toString()}`);

  // Fund Wallet 3 with 0.0011 BOT (enough for unpause() @ 28k gas + safety buffer)
  console.log("\n--- Funding Address 3 with 0.0011 BOT ---");
  const fund3 = await deployer.sendTransaction({
    to: wallet3.address,
    value: ethers.parseEther("0.0011"),
    gasPrice: gasPrice
  });
  console.log(`Fund 3 Tx: https://scan.botchain.ai/tx/${fund3.hash}`);
  await fund3.wait();

  // Interaction 4: Address 1 grants PAUSER_ROLE to Address 3
  console.log("\n[Interaction 4/5] - Address 1 (Deployer): grantRole(PAUSER_ROLE, Address 3)");
  const tx4 = await botJobs.grantRole(PAUSER_ROLE, wallet3.address, { gasPrice: gasPrice });
  console.log(`Tx 4: https://scan.botchain.ai/tx/${tx4.hash}`);
  const rec4 = await tx4.wait();
  console.log(`Tx 4 Confirmed! Gas used: ${rec4?.gasUsed.toString()}`);

  // Interaction 5: Address 3 calls unpause()
  console.log("\n[Interaction 5/5] - Address 3: unpause()");
  const botJobsWallet3 = botJobs.connect(wallet3);
  const tx5 = await botJobsWallet3.unpause({ gasPrice: gasPrice });
  console.log(`Tx 5: https://scan.botchain.ai/tx/${tx5.hash}`);
  const rec5 = await tx5.wait();
  console.log(`Tx 5 Confirmed! Gas used: ${rec5?.gasUsed.toString()}`);

  // Check final status
  const paused = await botJobs.paused();
  const endBal = await provider.getBalance(deployer.address);

  console.log("\n==================================================");
  console.log("All 5 Interactions Completed Successfully!");
  console.log("==================================================");
  console.log(`Contract Paused Status : ${paused} (Should be false)`);
  console.log(`Initial Deployer BOT   : ${ethers.formatEther(startBal)} BOT`);
  console.log(`Final Deployer BOT     : ${ethers.formatEther(endBal)} BOT`);
  console.log(`Total Spent in Run     : ${ethers.formatEther(startBal - endBal)} BOT`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exitCode = 1;
});
