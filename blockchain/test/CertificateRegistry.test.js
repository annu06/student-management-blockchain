const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let registry, owner, issuer, other;

  beforeEach(async function () {
    [owner, issuer, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CertificateRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
  });

  it("sets deployer as owner and authorized issuer", async function () {
    expect(await registry.owner()).to.equal(owner.address);
    expect(await registry.authorizedIssuers(owner.address)).to.equal(true);
  });

  it("issues a certificate and emits event", async function () {
    const tx = await registry.issueCertificate(
      1,
      "Anurag Polasa",
      "Blockchain Development",
      "QmTestIpfsHash123"
    );
    await expect(tx).to.emit(registry, "CertificateIssued");
  });

  it("verifies an issued certificate", async function () {
    await registry.issueCertificate(1, "Anurag", "Solidity 101", "QmHashA");
    const certId = ethers.keccak256(
      ethers.solidityPacked(["uint256", "string", "string"], [1, "Solidity 101", "QmHashA"])
    );

    const result = await registry.verifyCertificate(certId);
    expect(result.exists).to.equal(true);
    expect(result.valid).to.equal(true);
    expect(result.studentName).to.equal("Anurag");
    expect(result.courseName).to.equal("Solidity 101");
    expect(result.ipfsHash).to.equal("QmHashA");
  });

  it("returns exists=false for unknown certificate", async function () {
    const fakeId = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
    const result = await registry.verifyCertificate(fakeId);
    expect(result.exists).to.equal(false);
  });

  it("prevents duplicate certificates", async function () {
    await registry.issueCertificate(1, "Anurag", "Course", "QmDup");
    await expect(
      registry.issueCertificate(1, "Anurag", "Course", "QmDup")
    ).to.be.revertedWithCustomError(registry, "CertificateAlreadyExists");
  });

  it("blocks unauthorized issuers", async function () {
    await expect(
      registry.connect(other).issueCertificate(2, "Bob", "Course", "QmX")
    ).to.be.revertedWithCustomError(registry, "NotAuthorized");
  });

  it("allows owner to authorize a new issuer", async function () {
    await registry.authorizeIssuer(issuer.address);
    expect(await registry.authorizedIssuers(issuer.address)).to.equal(true);

    await expect(
      registry.connect(issuer).issueCertificate(3, "Carol", "Course", "QmY")
    ).to.emit(registry, "CertificateIssued");
  });

  it("revokes a certificate", async function () {
    await registry.issueCertificate(1, "Anurag", "Course", "QmRevoke");
    const certId = ethers.keccak256(
      ethers.solidityPacked(["uint256", "string", "string"], [1, "Course", "QmRevoke"])
    );

    await expect(registry.revokeCertificate(certId)).to.emit(registry, "CertificateRevoked");

    const result = await registry.verifyCertificate(certId);
    expect(result.exists).to.equal(true);
    expect(result.valid).to.equal(false);
  });

  it("tracks certificates per student", async function () {
    await registry.issueCertificate(5, "Dave", "Course A", "QmA");
    await registry.issueCertificate(5, "Dave", "Course B", "QmB");

    const certs = await registry.getStudentCertificates(5);
    expect(certs.length).to.equal(2);
  });
});
