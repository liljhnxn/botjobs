import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  const botJobsAddress = process.env.BOTJOBS_CONTRACT_ADDRESS;
  const botEscrowAddress = process.env.BOTESCROW_CONTRACT_ADDRESS;
  const botReputeAddress = process.env.BOTREPUTE_CONTRACT_ADDRESS;
  const botNSAddress = process.env.BOTNS_CONTRACT_ADDRESS;

  if (!botJobsAddress || !botEscrowAddress || !botReputeAddress || !botNSAddress) {
    throw new Error("Missing contract addresses in .env");
  }

  console.log("==================================================");
  console.log("Configuring Ecosystem Addresses on BotJobs");
  console.log("==================================================");
  console.log(`BotJobs Address : ${botJobsAddress}`);
  console.log(`Admin Signer    : ${signer.address}`);
  console.log(`BotEscrow       : ${botEscrowAddress}`);
  console.log(`BotRepute       : ${botReputeAddress}`);
  console.log(`BotNS           : ${botNSAddress}`);

  const botJobs = await ethers.getContractAt("BotJobs", botJobsAddress, signer);
  const tx = await botJobs.setEcosystemContracts(
    botEscrowAddress,
    botReputeAddress,
    botNSAddress
  );

  console.log(`Tx submitted    : ${tx.hash}`);
  await tx.wait();
  console.log("Ecosystem contracts successfully registered on-chain!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
