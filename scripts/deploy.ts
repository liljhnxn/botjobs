import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account found. Set PRIVATE_KEY in your .env file for Botchain Testnet deployment."
    );
  }

  const networkInfo = await ethers.provider.getNetwork();
  const chainId = Number(networkInfo.chainId);

  const botEscrowAddress =
    process.env.BOTESCROW_CONTRACT_ADDRESS &&
    ethers.isAddress(process.env.BOTESCROW_CONTRACT_ADDRESS)
      ? process.env.BOTESCROW_CONTRACT_ADDRESS
      : ethers.ZeroAddress;

  const botReputeAddress =
    process.env.BOTREPUTE_CONTRACT_ADDRESS &&
    ethers.isAddress(process.env.BOTREPUTE_CONTRACT_ADDRESS)
      ? process.env.BOTREPUTE_CONTRACT_ADDRESS
      : ethers.ZeroAddress;

  const botNSAddress =
    process.env.BOTNS_CONTRACT_ADDRESS &&
    ethers.isAddress(process.env.BOTNS_CONTRACT_ADDRESS)
      ? process.env.BOTNS_CONTRACT_ADDRESS
      : ethers.ZeroAddress;

  console.log("==================================================");
  console.log("Deploying BotJobs Marketplace Contract");
  console.log("==================================================");
  console.log(`Network Name       : ${network.name}`);
  console.log(`Chain ID           : ${chainId}`);
  console.log(`Deployer Address   : ${deployer.address}`);
  console.log(`BotEscrow Config   : ${botEscrowAddress === ethers.ZeroAddress ? "Not configured (0x0)" : botEscrowAddress}`);
  console.log(`BotRepute Config   : ${botReputeAddress === ethers.ZeroAddress ? "Not configured (0x0)" : botReputeAddress}`);
  console.log(`BotNS Config       : ${botNSAddress === ethers.ZeroAddress ? "Not configured (0x0)" : botNSAddress}`);

  const BotJobsFactory = await ethers.getContractFactory("BotJobs");
  const botJobs = await BotJobsFactory.deploy(
    deployer.address,
    botEscrowAddress,
    botReputeAddress,
    botNSAddress
  );

  const deployTx = botJobs.deploymentTransaction();
  await botJobs.waitForDeployment();
  const contractAddress = await botJobs.getAddress();
  const txHash = deployTx ? deployTx.hash : "N/A";

  const explorerBase = "https://scan.bohr.life";
  const explorerLink =
    chainId === 968
      ? `${explorerBase}/address/${contractAddress}`
      : `Local Hardhat Network (Chain ID ${chainId})`;

  console.log("--------------------------------------------------");
  console.log(`Contract Address   : ${contractAddress}`);
  console.log(`Chain ID           : ${chainId}`);
  console.log(`Deployment Tx Hash : ${txHash}`);
  console.log(`Explorer Link      : ${explorerLink}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
