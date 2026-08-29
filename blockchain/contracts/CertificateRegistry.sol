// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateRegistry
 * @notice Issues and verifies student achievement certificates on-chain.
 * @dev Certificate metadata (student name, course, grade, etc.) is stored on
 *      IPFS. Only the IPFS content hash (CID) + a keccak256 fingerprint of the
 *      certificate data are stored on-chain to keep gas costs low.
 */
contract CertificateRegistry is Ownable {
    struct Certificate {
        uint256 studentId;      // school DB student id
        string studentName;     // for quick on-chain reference
        string courseName;      // achievement / course title
        string ipfsHash;        // IPFS CID pointing to full metadata JSON
        uint256 issuedAt;       // block timestamp of issuance
        address issuer;         // admin address that issued it
        bool valid;             // can be revoked
    }

    // certificateId => Certificate
    mapping(bytes32 => Certificate) private certificates;
    // studentId => list of their certificate ids
    mapping(uint256 => bytes32[]) private studentCertificates;
    // authorized issuers (in addition to the owner)
    mapping(address => bool) public authorizedIssuers;

    event CertificateIssued(
        bytes32 indexed certificateId,
        uint256 indexed studentId,
        string courseName,
        string ipfsHash,
        address indexed issuer
    );
    event CertificateRevoked(bytes32 indexed certificateId, address indexed revokedBy);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    error NotAuthorized();
    error CertificateAlreadyExists();
    error CertificateNotFound();

    constructor() Ownable(msg.sender) {
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyIssuer() {
        if (!authorizedIssuers[msg.sender] && msg.sender != owner()) {
            revert NotAuthorized();
        }
        _;
    }

    /**
     * @notice Authorize an address to issue certificates.
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    /**
     * @notice Revoke an issuer's authorization.
     */
    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    /**
     * @notice Issue a new certificate.
     * @dev certificateId is derived deterministically from studentId, course
     *      and ipfsHash so duplicates are impossible.
     */
    function issueCertificate(
        uint256 studentId,
        string calldata studentName,
        string calldata courseName,
        string calldata ipfsHash
    ) external onlyIssuer returns (bytes32 certificateId) {
        certificateId = keccak256(abi.encodePacked(studentId, courseName, ipfsHash));

        if (certificates[certificateId].issuedAt != 0) {
            revert CertificateAlreadyExists();
        }

        certificates[certificateId] = Certificate({
            studentId: studentId,
            studentName: studentName,
            courseName: courseName,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            issuer: msg.sender,
            valid: true
        });

        studentCertificates[studentId].push(certificateId);

        emit CertificateIssued(certificateId, studentId, courseName, ipfsHash, msg.sender);
    }

    /**
     * @notice Revoke a previously issued certificate.
     */
    function revokeCertificate(bytes32 certificateId) external onlyIssuer {
        if (certificates[certificateId].issuedAt == 0) {
            revert CertificateNotFound();
        }
        certificates[certificateId].valid = false;
        emit CertificateRevoked(certificateId, msg.sender);
    }

    /**
     * @notice Verify a certificate by its id. Returns full details.
     */
    function verifyCertificate(bytes32 certificateId)
        external
        view
        returns (
            bool exists,
            bool valid,
            uint256 studentId,
            string memory studentName,
            string memory courseName,
            string memory ipfsHash,
            uint256 issuedAt,
            address issuer
        )
    {
        Certificate memory cert = certificates[certificateId];
        exists = cert.issuedAt != 0;
        return (
            exists,
            cert.valid,
            cert.studentId,
            cert.studentName,
            cert.courseName,
            cert.ipfsHash,
            cert.issuedAt,
            cert.issuer
        );
    }

    /**
     * @notice Get all certificate ids for a given student.
     */
    function getStudentCertificates(uint256 studentId)
        external
        view
        returns (bytes32[] memory)
    {
        return studentCertificates[studentId];
    }
}
