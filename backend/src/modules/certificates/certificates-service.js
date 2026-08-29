const { ApiError } = require("../../utils");
const { uploadMetadata, getGatewayUrl } = require("./certificates-ipfs");
const {
    issueOnChain,
    verifyOnChain,
    revokeOnChain,
    getStudentCertificatesOnChain,
} = require("./certificates-blockchain");
const {
    saveCertificate,
    findCertificatesByStudent,
    findCertificateById,
    updateCertificateStatus,
} = require("./certificates-repository");

/**
 * Issue a certificate:
 * 1. Build metadata + upload to IPFS
 * 2. Record on-chain (issuer wallet)
 * 3. Persist reference in the DB
 */
const issueCertificate = async ({ studentId, studentName, courseName, grade, description }) => {
    // 1. Build metadata and pin to IPFS
    const metadata = {
        studentId,
        studentName,
        courseName,
        grade: grade || null,
        description: description || null,
        issuedOn: new Date().toISOString(),
        type: "student-achievement-certificate",
    };
    const { ipfsHash } = await uploadMetadata(metadata);

    // 2. Record on-chain
    const { certificateId, txHash } = await issueOnChain({
        studentId,
        studentName,
        courseName,
        ipfsHash,
    });

    // 3. Persist in DB
    await saveCertificate({
        certificateId,
        studentId,
        courseName,
        ipfsHash,
        txHash,
    });

    return {
        certificateId,
        txHash,
        ipfsHash,
        ipfsUrl: getGatewayUrl(ipfsHash),
    };
};

/**
 * Verify a certificate against the blockchain (source of truth).
 */
const verifyCertificate = async (certificateId) => {
    const onChain = await verifyOnChain(certificateId);
    if (!onChain.exists) {
        throw new ApiError(404, "Certificate not found on blockchain");
    }
    return {
        ...onChain,
        ipfsUrl: getGatewayUrl(onChain.ipfsHash),
        status: onChain.valid ? "VALID" : "REVOKED",
    };
};

/**
 * Revoke a certificate on-chain and update DB status.
 */
const revokeCertificate = async (certificateId) => {
    const cert = await findCertificateById(certificateId);
    if (!cert) throw new ApiError(404, "Certificate not found");

    const { txHash } = await revokeOnChain(certificateId);
    await updateCertificateStatus(certificateId, "REVOKED");
    return { certificateId, txHash, status: "REVOKED" };
};

/**
 * Get all certificates for a student (DB records enriched with IPFS urls).
 */
const getStudentCertificates = async (studentId) => {
    const records = await findCertificatesByStudent(studentId);
    return records.map((r) => ({
        ...r,
        ipfsUrl: getGatewayUrl(r.ipfs_hash),
    }));
};

module.exports = {
    issueCertificate,
    verifyCertificate,
    revokeCertificate,
    getStudentCertificates,
};
