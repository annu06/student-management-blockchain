/**
 * Standalone integration test — verifies the backend blockchain module can
 * issue and verify a certificate against the locally deployed contract.
 * Run: node test-integration.js  (with hardhat node running + contract deployed)
 */
process.env.BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK || "localhost";
process.env.BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
// Set ISSUER_PRIVATE_KEY in your environment before running.
// For local dev use Hardhat account #0 (publicly known dev key).
if (!process.env.ISSUER_PRIVATE_KEY) {
    console.error("Set ISSUER_PRIVATE_KEY env var (use a Hardhat dev account key for local testing).");
    process.exit(1);
}

const path = require("path");
const backendModule = path.resolve(
    __dirname,
    "../backend/src/modules/certificates/certificates-blockchain.js"
);
const { issueOnChain, verifyOnChain, getStudentCertificatesOnChain } = require(backendModule);

async function run() {
    console.log("=== Issuing certificate on-chain ===");
    const { certificateId, txHash } = await issueOnChain({
        studentId: 101,
        studentName: "Anurag Polasa",
        courseName: "Blockchain Development",
        ipfsHash: "QmDemoIpfsHash123456",
    });
    console.log("certificateId:", certificateId);
    console.log("txHash:", txHash);

    console.log("\n=== Verifying certificate ===");
    const verification = await verifyOnChain(certificateId);
    console.log(verification);

    console.log("\n=== Student certificates ===");
    const certs = await getStudentCertificatesOnChain(101);
    console.log(certs);

    if (verification.exists && verification.valid && verification.studentName === "Anurag Polasa") {
        console.log("\n✅ END-TO-END BLOCKCHAIN FLOW WORKS!");
    } else {
        console.log("\n❌ Verification mismatch");
        process.exit(1);
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
