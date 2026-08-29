const { processDBRequest } = require("../../utils");

/**
 * Persist a certificate reference in the DB.
 * (On-chain data is the source of truth; DB is for fast listing/indexing.)
 */
const saveCertificate = async ({ certificateId, studentId, courseName, ipfsHash, txHash }) => {
    const query = `
        INSERT INTO certificates
            (certificate_id, student_id, course_name, ipfs_hash, tx_hash, status, issued_at)
        VALUES ($1, $2, $3, $4, $5, 'VALID', NOW())
        RETURNING id
    `;
    const queryParams = [certificateId, studentId, courseName, ipfsHash, txHash];
    const { rows } = await processDBRequest({ query, queryParams });
    return rows[0];
};

const findCertificatesByStudent = async (studentId) => {
    const query = `
        SELECT id, certificate_id, student_id, course_name, ipfs_hash, tx_hash, status, issued_at
        FROM certificates
        WHERE student_id = $1
        ORDER BY issued_at DESC
    `;
    const { rows } = await processDBRequest({ query, queryParams: [studentId] });
    return rows;
};

const findCertificateById = async (certificateId) => {
    const query = `
        SELECT id, certificate_id, student_id, course_name, ipfs_hash, tx_hash, status, issued_at
        FROM certificates
        WHERE certificate_id = $1
    `;
    const { rows } = await processDBRequest({ query, queryParams: [certificateId] });
    return rows[0];
};

const updateCertificateStatus = async (certificateId, status) => {
    const query = `
        UPDATE certificates SET status = $2 WHERE certificate_id = $1
    `;
    await processDBRequest({ query, queryParams: [certificateId, status] });
};

module.exports = {
    saveCertificate,
    findCertificatesByStudent,
    findCertificateById,
    updateCertificateStatus,
};
