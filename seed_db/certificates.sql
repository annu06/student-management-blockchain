-- Certificate Verification System table
-- Stores references to on-chain certificates for fast querying/listing.
-- The blockchain is the source of truth; this table is an index.

CREATE TABLE IF NOT EXISTS certificates (
    id              SERIAL PRIMARY KEY,
    certificate_id  VARCHAR(66) NOT NULL UNIQUE,   -- bytes32 hex from contract
    student_id      INTEGER NOT NULL,
    course_name     VARCHAR(255) NOT NULL,
    ipfs_hash       VARCHAR(255) NOT NULL,         -- IPFS CID
    tx_hash         VARCHAR(66) NOT NULL,          -- issuance transaction hash
    status          VARCHAR(20) NOT NULL DEFAULT 'VALID',  -- VALID | REVOKED
    issued_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates (student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates (certificate_id);
