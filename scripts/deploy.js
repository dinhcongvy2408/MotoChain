const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying MotoChain contract...");

  const MotoChain = await hre.ethers.getContractFactory("MotoChain");
  const motochain = await MotoChain.deploy();
  await motochain.waitForDeployment();

  const address = await motochain.getAddress();
  console.log(`MotoChain deployed to: ${address}`);

  // Get ABI from artifact
  const artifact = await hre.artifacts.readArtifact("MotoChain");

  // Save combined config to client/public for runtime fetch
  const publicDir = path.join(__dirname, "..", "client", "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const config = {
    address: address,
    abi: artifact.abi,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(publicDir, "contract-config.json"),
    JSON.stringify(config, null, 2)
  );

  console.log("Contract config saved to client/public/contract-config.json");
  console.log("Now run: cd client && npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
