import { api, Tag } from '@/api';
import {
  IssueCertificatePayload,
  IssueCertificateResponse,
  StudentCertificatesResponse,
  VerifyCertificateResponse
} from '../types';

export const certificateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    issueCertificate: builder.mutation<IssueCertificateResponse, IssueCertificatePayload>({
      query: (payload) => ({
        url: `/certificates`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [Tag.CERTIFICATES]
    }),
    getStudentCertificates: builder.query<StudentCertificatesResponse, number>({
      query: (studentId) => `/certificates/student/${studentId}`,
      providesTags: [Tag.CERTIFICATES]
    }),
    verifyCertificate: builder.query<VerifyCertificateResponse, string>({
      query: (certificateId) => `/certificates/verify/${certificateId}`
    }),
    revokeCertificate: builder.mutation<{ message: string }, string>({
      query: (certificateId) => ({
        url: `/certificates/revoke/${certificateId}`,
        method: 'POST'
      }),
      invalidatesTags: [Tag.CERTIFICATES]
    })
  })
});

export const {
  useIssueCertificateMutation,
  useGetStudentCertificatesQuery,
  useLazyVerifyCertificateQuery,
  useRevokeCertificateMutation
} = certificateApi;
