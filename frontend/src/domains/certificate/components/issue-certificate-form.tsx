import { useState } from 'react';
import { Box, Button, Grid, TextField, Alert, Link, CircularProgress } from '@mui/material';
import { useIssueCertificateMutation } from '../api';

export const IssueCertificateForm = () => {
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    courseName: '',
    grade: '',
    description: ''
  });

  const [issueCertificate, { isLoading, data, error }] = useIssueCertificateMutation();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await issueCertificate({
      studentId: Number(form.studentId),
      studentName: form.studentName,
      courseName: form.courseName,
      grade: form.grade || undefined,
      description: form.description || undefined
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="number"
            label="Student ID"
            value={form.studentId}
            onChange={handleChange('studentId')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Student Name"
            value={form.studentName}
            onChange={handleChange('studentName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Course / Achievement"
            value={form.courseName}
            onChange={handleChange('courseName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Grade (optional)"
            value={form.grade}
            onChange={handleChange('grade')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (optional)"
            value={form.description}
            onChange={handleChange('description')}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={22} /> : 'Issue Certificate on Blockchain'}
          </Button>
        </Grid>
      </Grid>

      {data && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Certificate issued! <br />
          <strong>Certificate ID:</strong> {data.data.certificateId} <br />
          <strong>Tx Hash:</strong> {data.data.txHash} <br />
          <Link href={data.data.ipfsUrl} target="_blank" rel="noopener">
            View metadata on IPFS
          </Link>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to issue certificate. Check that the contract is deployed and the issuer wallet is
          configured.
        </Alert>
      )}
    </Box>
  );
};
