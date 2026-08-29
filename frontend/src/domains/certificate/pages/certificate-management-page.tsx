import { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography, Divider } from '@mui/material';
import { WalletConnect, IssueCertificateForm, VerifyCertificate } from '../components';

export const CertificateManagementPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Certificate Verification System</Typography>
        <WalletConnect />
      </Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Issue blockchain-backed certificates for student achievements and verify their authenticity
        on-chain.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Paper sx={{ p: 3 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Issue Certificate" />
          <Tab label="Verify Certificate" />
        </Tabs>

        {tab === 0 && <IssueCertificateForm />}
        {tab === 1 && <VerifyCertificate />}
      </Paper>
    </Box>
  );
};
