export interface IssueCertificatePayload {
  studentId: number;
  studentName: string;
  courseName: string;
  grade?: string;
  description?: string;
}

export interface IssueCertificateResponse {
  message: string;
  data: {
    certificateId: string;
    txHash: string;
    ipfsHash: string;
    ipfsUrl: string;
  };
}

export interface CertificateRecord {
  id: number;
  certificate_id: string;
  student_id: number;
  course_name: string;
  ipfs_hash: string;
  tx_hash: string;
  status: 'VALID' | 'REVOKED';
  issued_at: string;
  ipfsUrl: string;
}

export interface StudentCertificatesResponse {
  message: string;
  data: CertificateRecord[];
}

export interface VerifyCertificateResponse {
  message: string;
  data: {
    exists: boolean;
    valid: boolean;
    studentId: number;
    studentName: string;
    courseName: string;
    ipfsHash: string;
    issuedAt: number;
    issuer: string;
    ipfsUrl: string;
    status: 'VALID' | 'REVOKED';
  };
}
