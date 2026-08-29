const axios = require("axios");

/**
 * IPFS metadata storage using Pinata (pinata.cloud).
 * Stores the full certificate metadata JSON and returns the IPFS CID.
 *
 * Configure with env vars:
 *   PINATA_JWT           - Pinata API JWT (recommended)
 *   IPFS_GATEWAY_URL     - Gateway for reading (default: https://gateway.pinata.cloud/ipfs/)
 */

const PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

/**
 * Upload certificate metadata to IPFS. Returns the CID (ipfsHash).
 */
async function uploadMetadata(metadata) {
    const jwt = process.env.PINATA_JWT;

    // If no Pinata credentials, fall back to a deterministic mock hash so the
    // rest of the flow (contract + DB) still works in local development.
    if (!jwt) {
        const crypto = require("crypto");
        const hash = crypto
            .createHash("sha256")
            .update(JSON.stringify(metadata))
            .digest("hex")
            .slice(0, 44);
        return { ipfsHash: `Qm${hash}`, mock: true };
    }

    const response = await axios.post(
        PINATA_PIN_JSON_URL,
        {
            pinataContent: metadata,
            pinataMetadata: { name: `certificate-${metadata.studentId}-${Date.now()}` },
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
        }
    );

    return { ipfsHash: response.data.IpfsHash, mock: false };
}

/**
 * Build the gateway URL to view metadata for a given CID.
 */
function getGatewayUrl(ipfsHash) {
    const gateway = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";
    return `${gateway}${ipfsHash}`;
}

module.exports = { uploadMetadata, getGatewayUrl };
