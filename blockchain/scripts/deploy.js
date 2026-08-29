const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying CertificateRegistry...");

  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const registry = await CertificateRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`CertificateRegistry deployed to: ${address}`);

  // Save the deployed address + ABI so the backend/frontend can consume it.
  const artifact = await hre.artifacts.readArtifact("CertificateRegistry");
  const deployment = {
    network: hre.network.name,
    address,
    abi: artifact.abi,
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `${hre.network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log(`Deployment info saved to: ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
