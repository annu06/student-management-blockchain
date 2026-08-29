# Problem 3: Blockchain Certificate Verification System

Blockchain-based certificate verification for student achievements. Certificates
are issued and verified on an EVM chain, with metadata stored on IPFS.

## What was implemented

| Requirement | Solution |
|-------------|----------|
| Smart contract for issuance & verification | `contracts/CertificateRegistry.sol` (Solidity 0.8.20, OpenZeppelin Ownable) |
| Web3 wallet connection in frontend | `frontend/src/domains/certificate/hooks/use-wallet.ts` + `wallet-connect.tsx` |
| Certificate management in admin panel | `frontend/src/domains/certificate/pages/certificate-management-page.tsx` |
| IPFS metadata storage | `backend/src/modules/certificates/certificates-ipfs.js` (Pinata) |

## Architecture

```
Admin Panel (React + MetaMask)
        │
        ▼
Backend API (/api/v1/certificates)
        │
        ├──► IPFS (Pinata)  — stores full certificate metadata JSON
        │
        └──► CertificateRegistry.sol (EVM) — stores CID + fingerprint on-chain
                                             (source of truth for verification)
```

- **On-chain**: certificateId (keccak256), studentId, name, course, IPFS CID, issuer, validity.
- **Off-chain (IPFS)**: full metadata (grade, description, timestamps).
- **DB**: index table for fast listing (blockchain remains source of truth).

## Smart Contract

`CertificateRegistry.sol` features:
- `issueCertificate()` — only authorized issuers (admin)
- `verifyCertificate()` — public read, returns full details + validity
- `revokeCertificate()` — invalidate a certificate
- `getStudentCertificates()` — list all certs for a student
- `authorizeIssuer()` / `revokeIssuer()` — access control
- Custom errors for gas efficiency, deterministic IDs prevent duplicates

## Setup & Run

### 1. Blockchain (this folder)

```bash
cd blockchain
npm install
npm test                 # runs 9 contract tests — all pass
npm run node             # start local hardhat chain (keep running)
npm run deploy:local     # deploy contract → creates deployments/localhost.json
```

For testnets:
```bash
cp .env.example .env     # fill RPC URLs + PRIVATE_KEY
npm run deploy:sepolia   # Ethereum Sepolia
npm run deploy:amoy      # Polygon Amoy
```

### 2. Backend

```bash
cd backend
npm install              # ethers already added
# Add blockchain vars to .env (see .env.example):
#   BLOCKCHAIN_NETWORK=localhost
#   BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
#   ISSUER_PRIVATE_KEY=<hardhat account #0 key>
#   PINATA_JWT=          (empty = mock IPFS hash in dev)
# Create the DB table:
psql -d school_mgmt -f ../seed_db/certificates.sql
npm start
```

### 3. Frontend

```bash
cd frontend
npm install
npm install ethers       # for wallet + provider
npm run dev
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/certificates` | admin | Issue certificate (IPFS + on-chain + DB) |
| GET | `/api/v1/certificates/verify/:certificateId` | public | Verify a certificate on-chain |
| GET | `/api/v1/certificates/student/:studentId` | admin | List a student's certificates |
| POST | `/api/v1/certificates/revoke/:certificateId` | admin | Revoke a certificate |

## Verification

- Contract tests: `npm test` → **9 passing**
- End-to-end backend↔chain: `node test-integration.js` (with node running) → issues, verifies, lists a certificate successfully.

## Files Added

```
blockchain/
├── contracts/CertificateRegistry.sol
├── scripts/deploy.js
├── test/CertificateRegistry.test.js
├── test-integration.js
├── hardhat.config.js
└── deployments/localhost.json   (generated)

backend/src/modules/certificates/
├── certificates-router.js
├── certificates-controller.js
├── certificates-service.js
├── certificates-repository.js
├── certificates-blockchain.js   (ethers contract interaction)
└── certificates-ipfs.js         (Pinata IPFS upload)

frontend/src/domains/certificate/
├── hooks/use-wallet.ts
├── api/certificate-api.ts
├── types/index.ts
├── components/{wallet-connect,issue-certificate-form,verify-certificate}.tsx
└── pages/certificate-management-page.tsx

seed_db/certificates.sql
```
