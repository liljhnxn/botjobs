import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account found. Set PRIVATE_KEY in your .env file for Botchain Mainnet deployment."
    );
  }

  const networkInfo = await ethers.provider.getNetwork();
  const chainId = Number(networkInfo.chainId);

  let botEscrowAddress =
    process.env.BOTESCROW_CONTRACT_ADDRESS &&
    ethers.isAddress(process.env.BOTESCROW_CONTRACT_ADDRESS)
      ? process.env.BOTESCROW_CONTRACT_ADDRESS
      : ethers.ZeroAddress;

  let botReputeAddress =
    process.env.BOTREPUTE_CONTRACT_ADDRESS &&
    ethers.isAddress(process.env.BOTREPUTE_CONTRACT_ADDRESS)
      ? process.env.BOTREPUTE_CONTRACT_ADDRESS
      : ethers.ZeroAddress;

  let botNSAddress =
    process.env.BOTNS_CONTRACT_ADDRESS &&
    ethers.isAddress(process.env.BOTNS_CONTRACT_ADDRESS)
      ? process.env.BOTNS_CONTRACT_ADDRESS
      : ethers.ZeroAddress;

  // On live chains, verify if bytecode actually exists at these addresses
  if (chainId !== 31337) {
    if (botEscrowAddress !== ethers.ZeroAddress) {
      const code = await ethers.provider.getCode(botEscrowAddress);
      if (code === "0x" || code === "0x0") {
        console.warn(`[WARN] BotEscrow address ${botEscrowAddress} has no bytecode on chain ${chainId}. Setting to ZeroAddress.`);
        botEscrowAddress = ethers.ZeroAddress;
      }
    }
    if (botReputeAddress !== ethers.ZeroAddress) {
      const code = await ethers.provider.getCode(botReputeAddress);
      if (code === "0x" || code === "0x0") {
        console.warn(`[WARN] BotRepute address ${botReputeAddress} has no bytecode on chain ${chainId}. Setting to ZeroAddress.`);
        botReputeAddress = ethers.ZeroAddress;
      }
    }
    if (botNSAddress !== ethers.ZeroAddress) {
      const code = await ethers.provider.getCode(botNSAddress);
      if (code === "0x" || code === "0x0") {
        console.warn(`[WARN] BotNS address ${botNSAddress} has no bytecode on chain ${chainId}. Setting to ZeroAddress.`);
        botNSAddress = ethers.ZeroAddress;
      }
    }
  }

  const balanceBefore = await ethers.provider.getBalance(deployer.address);
  const feeData = await ethers.provider.getFeeData();
  const minGasPrice = feeData.gasPrice ?? 20000000000n;

  console.log("==================================================");
  console.log("Deploying BotJobs Marketplace Contract");
  console.log("==================================================");
  console.log(`Network Name       : ${network.name}`);
  console.log(`Chain ID           : ${chainId}`);
  console.log(`Deployer Address   : ${deployer.address}`);
  console.log(`Deployer Balance   : ${ethers.formatEther(balanceBefore)} BOT`);
  console.log(`Gas Price (Lowest) : ${ethers.formatUnits(minGasPrice, "gwei")} gwei`);
  console.log(`BotEscrow Config   : ${botEscrowAddress === ethers.ZeroAddress ? "Not configured (0x0)" : botEscrowAddress}`);
  console.log(`BotRepute Config   : ${botReputeAddress === ethers.ZeroAddress ? "Not configured (0x0)" : botReputeAddress}`);
  console.log(`BotNS Config       : ${botNSAddress === ethers.ZeroAddress ? "Not configured (0x0)" : botNSAddress}`);

  const BotJobsFactory = await ethers.getContractFactory("BotJobs");
  const botJobs = await BotJobsFactory.deploy(
    deployer.address,
    botEscrowAddress,
    botReputeAddress,
    botNSAddress,
    { gasPrice: minGasPrice }
  );

  const deployTx = botJobs.deploymentTransaction();
  console.log(`Deployment Tx Sent : ${deployTx ? deployTx.hash : "Pending..."}`);
  console.log("Waiting for block confirmation...");

  await botJobs.waitForDeployment();
  const contractAddress = await botJobs.getAddress();
  const txHash = deployTx ? deployTx.hash : "N/A";

  const receipt = deployTx ? await deployTx.wait() : null;
  const gasUsed = receipt?.gasUsed ?? 0n;
  const effectiveGasPrice = receipt?.gasPrice ?? minGasPrice;
  const totalCost = gasUsed * effectiveGasPrice;

  const balanceAfter = await ethers.provider.getBalance(deployer.address);

  const explorerLink =
    chainId === 677
      ? `https://scan.botchain.ai/address/${contractAddress}`
      : `Local Network (Chain ID ${chainId}) / https://scan.botchain.ai/address/${contractAddress}`;

  console.log("--------------------------------------------------");
  console.log(`Contract Address   : ${contractAddress}`);
  console.log(`Chain ID           : ${chainId}`);
  console.log(`Deployment Tx Hash : ${txHash}`);
  console.log(`Gas Units Used     : ${gasUsed.toString()}`);
  console.log(`Effective Fee Paid : ${ethers.formatEther(totalCost)} BOT`);
  console.log(`Remaining Balance  : ${ethers.formatEther(balanceAfter)} BOT`);
  console.log(`Explorer Link      : ${explorerLink}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
