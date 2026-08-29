const asyncHandler = require("express-async-handler");
const {
    issueCertificate,
    verifyCertificate,
    revokeCertificate,
    getStudentCertificates,
} = require("./certificates-service");

const handleIssueCertificate = asyncHandler(async (req, res) => {
    const { studentId, studentName, courseName, grade, description } = req.body;

    if (!studentId || !studentName || !courseName) {
        return res.status(400).json({
            message: "studentId, studentName and courseName are required",
        });
    }

    const result = await issueCertificate({ studentId, studentName, courseName, grade, description });
    res.status(201).json({
        message: "Certificate issued successfully",
        data: result,
    });
});

const handleVerifyCertificate = asyncHandler(async (req, res) => {
    const { certificateId } = req.params;
    const result = await verifyCertificate(certificateId);
    res.json({
        message: "Certificate verification result",
        data: result,
    });
});

const handleRevokeCertificate = asyncHandler(async (req, res) => {
    const { certificateId } = req.params;
    const result = await revokeCertificate(certificateId);
    res.json({
        message: "Certificate revoked successfully",
        data: result,
    });
});

const handleGetStudentCertificates = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const result = await getStudentCertificates(studentId);
    res.json({
        message: "Student certificates fetched successfully",
        data: result,
    });
});

module.exports = {
    handleIssueCertificate,
    handleVerifyCertificate,
    handleRevokeCertificate,
    handleGetStudentCertificates,
};
