const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

/**
 * Loads the deployed CertificateRegistry contract (address + ABI) from the
 * blockchain/deployments folder produced by the Hardhat deploy script.
 * Falls back to env vars if the deployment file is not present.
 */
function loadDeployment() {
    const network = process.env.BLOCKCHAIN_NETWORK || "localhost";
    const deploymentPath = path.resolve(
        __dirname,
        "../../../../blockchain/deployments",
        `${network}.json`
    );

    if (fs.existsSync(deploymentPath)) {
        return JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    }

    // Fallback: read from env (address + ABI json string)
    if (process.env.CONTRACT_ADDRESS && process.env.CONTRACT_ABI) {
        return {
            address: process.env.CONTRACT_ADDRESS,
            abi: JSON.parse(process.env.CONTRACT_ABI),
        };
    }

    throw new Error(
        "Contract deployment not found. Deploy the contract first (npm run deploy:local in /blockchain)."
    );
}

let _contract = null;
let _provider = null;

/**
 * Build a JsonRpcProvider with a static network to avoid the network
 * auto-detection handshake, which can hang on some Node versions.
 */
function buildProvider(rpcUrl) {
    const chainId = Number(process.env.BLOCKCHAIN_CHAIN_ID || 31337);
    return new ethers.JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
}

/**
 * Returns a read-only contract instance (for verification queries).
 */
function getReadContract() {
    if (_contract) return _contract;
    const deployment = loadDeployment();
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    _provider = buildProvider(rpcUrl);
    _contract = new ethers.Contract(deployment.address, deployment.abi, _provider);
    return _contract;
}

/**
 * Returns a signer-connected contract instance (for issuing/revoking).
 * Uses the issuer private key from env.
 */
function getWriteContract() {
    const deployment = loadDeployment();
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    const provider = buildProvider(rpcUrl);
    const pk = process.env.ISSUER_PRIVATE_KEY;
    if (!pk) throw new Error("ISSUER_PRIVATE_KEY not configured");
    const signer = new ethers.Wallet(pk, provider);
    return new ethers.Contract(deployment.address, deployment.abi, signer);
}

/**
 * Issue a certificate on-chain.
 */
async function issueOnChain({ studentId, studentName, courseName, ipfsHash }) {
    const contract = getWriteContract();
    const tx = await contract.issueCertificate(studentId, studentName, courseName, ipfsHash);
    const receipt = await tx.wait();

    // Derive the certificateId the same way the contract does.
    const certificateId = ethers.keccak256(
        ethers.solidityPacked(["uint256", "string", "string"], [studentId, courseName, ipfsHash])
    );

    return { certificateId, txHash: receipt.hash };
}

/**
 * Verify a certificate on-chain by its id.
 */
async function verifyOnChain(certificateId) {
    const contract = getReadContract();
    const result = await contract.verifyCertificate(certificateId);
    return {
        exists: result.exists,
        valid: result.valid,
        studentId: Number(result.studentId),
        studentName: result.studentName,
        courseName: result.courseName,
        ipfsHash: result.ipfsHash,
        issuedAt: Number(result.issuedAt),
        issuer: result.issuer,
    };
}

/**
 * Revoke a certificate on-chain.
 */
async function revokeOnChain(certificateId) {
    const contract = getWriteContract();
    const tx = await contract.revokeCertificate(certificateId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
}

/**
 * Get all certificate ids for a student.
 */
async function getStudentCertificatesOnChain(studentId) {
    const contract = getReadContract();
    return await contract.getStudentCertificates(studentId);
}

module.exports = {
    issueOnChain,
    verifyOnChain,
    revokeOnChain,
    getStudentCertificatesOnChain,
};
