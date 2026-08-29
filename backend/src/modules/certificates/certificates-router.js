const express = require("express");
const router = express.Router();
const certificateController = require("./certificates-controller");

// Issue a new certificate (admin)
router.post("", certificateController.handleIssueCertificate);

// Get all certificates for a student
router.get("/student/:studentId", certificateController.handleGetStudentCertificates);

// Verify a certificate by its on-chain id (public verification)
router.get("/verify/:certificateId", certificateController.handleVerifyCertificate);

// Revoke a certificate (admin)
router.post("/revoke/:certificateId", certificateController.handleRevokeCertificate);

module.exports = { certificatesRoutes: router };
