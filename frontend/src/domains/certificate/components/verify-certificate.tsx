import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Typography,
  Chip,
  Link,
  CircularProgress
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import GppBadIcon from '@mui/icons-material/GppBad';
import { useLazyVerifyCertificateQuery } from '../api';

export const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [verify, { data, error, isFetching }] = useLazyVerifyCertificateQuery();

  const handleVerify = () => {
    if (certificateId.trim()) verify(certificateId.trim());
  };

  const cert = data?.data;

  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center">
        <TextField
          fullWidth
          label="Certificate ID (0x...)"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
        />
        <Button variant="contained" onClick={handleVerify} disabled={isFetching}>
          {isFetching ? <CircularProgress size={22} /> : 'Verify'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Certificate not found on the blockchain.
        </Alert>
      )}

      {cert && (
        <Card sx={{ mt: 3 }} variant="outlined">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {cert.valid ? (
                <Chip icon={<VerifiedIcon />} label="VALID" color="success" />
              ) : (
                <Chip icon={<GppBadIcon />} label="REVOKED" color="error" />
              )}
            </Box>
            <Typography>
              <strong>Student:</strong> {cert.studentName} (ID: {cert.studentId})
            </Typography>
            <Typography>
              <strong>Course:</strong> {cert.courseName}
            </Typography>
            <Typography>
              <strong>Issued:</strong> {new Date(cert.issuedAt * 1000).toLocaleString()}
            </Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>
              <strong>Issuer:</strong> {cert.issuer}
            </Typography>
            <Link href={cert.ipfsUrl} target="_blank" rel="noopener">
              View full metadata on IPFS
            </Link>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
