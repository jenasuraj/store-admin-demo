import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Search, Bell, Menu, FileSpreadsheet } from 'lucide-react';

// Define the exact data structure from your images
interface Transaction {
  source_system: string;
  txn_date: string;
  account_no: string;
  product_code: string;
  txn_ref: string;
  debit: number;
  credit: number;
  currency: string;
  net_amount: number;
}

const SystemDashboard = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Simulate network request loading time
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Configuration map based on pathname
  const configMap: Record<string, any> = {
    '/oracle-home': {
      title: 'Oracle GL Dashboard',
      logo: 'O',
      color: 'bg-red-600',
      exportUrl: '/autobot/Oracle_Fusion_GL.xlsx',
      exportName: 'oracle_gl_data.xlsx',
      data: [
        { source_system: 'ORACLE_GL', txn_date: '2026-02-01', account_no: 'GL_LOANS', product_code: 'HL', txn_ref: 'TXN1001', debit: 100000, credit: 0, currency: 'INR', net_amount: -100000 },
        { source_system: 'ORACLE_GL', txn_date: '2026-02-05', account_no: 'GL_EMI', product_code: 'HL', txn_ref: 'TXN1002', debit: 0, credit: 8000, currency: 'INR', net_amount: 8000 },
        { source_system: 'ORACLE_GL', txn_date: '2026-02-06', account_no: 'GL_LOANS', product_code: 'PL', txn_ref: 'TXN2001', debit: 50000, credit: 0, currency: 'INR', net_amount: -50000 },

        { source_system: 'ORACLE_GL', txn_date: '1/4/2025 14:13', account_no: 'GL_OTHER', product_code: 'PL', txn_ref: 'TXN1005173', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'ORACLE_GL', txn_date: '2/23/2025 17:50', account_no: 'GL_OTHER', product_code: 'PL', txn_ref: 'TXN1077390', debit: 0, credit: 7421, currency: 'INR', net_amount: 7421 },
        { source_system: 'ORACLE_GL', txn_date: '2/21/2025 5:04', account_no: 'GL_OTHER', product_code: 'PL', txn_ref: 'TXN1073744', debit: 60254, credit: 0, currency: 'INR', net_amount: -60254 },
        { source_system: 'ORACLE_GL', txn_date: '2/14/2025 2:14', account_no: 'GL_HL', product_code: 'HL', txn_ref: 'TXN1063494', debit: 99502, credit: 0, currency: 'INR', net_amount: -99502 },
        { source_system: 'ORACLE_GL', txn_date: '1/23/2025 6:04', account_no: 'GL_HL', product_code: 'HL', txn_ref: 'TXN1032044', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'ORACLE_GL', txn_date: '1/12/2025 14:31', account_no: 'GL_OTHER', product_code: 'AL', txn_ref: 'TXN1016711', debit: 22652, credit: 0, currency: 'INR', net_amount: -22652 },
        { source_system: 'ORACLE_GL', txn_date: '3/6/2025 3:16', account_no: 'GL_HL', product_code: 'HL', txn_ref: 'TXN1092356', debit: 0, credit: 5669, currency: 'INR', net_amount: 5669 },
        { source_system: 'ORACLE_GL', txn_date: '1/14/2025 7:17', account_no: 'GL_HL', product_code: 'HL', txn_ref: 'TXN1019157', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'ORACLE_GL', txn_date: '3/7/2025 0:17', account_no: 'GL_HL', product_code: 'HL', txn_ref: 'TXN1093617', debit: 93849, credit: 9421, currency: 'INR', net_amount: -84428 },
        { source_system: 'ORACLE_GL', txn_date: '2/1/2025 21:20', account_no: 'GL_OTHER', product_code: 'AL', txn_ref: 'TXN1045920', debit: 67867, credit: 0, currency: 'INR', net_amount: -67867 },
        { source_system: 'ORACLE_GL', txn_date: '2/22/2025 20:10', account_no: 'GL_HL', product_code: 'HL', txn_ref: 'TXN1076090', debit: 40293, credit: 8253, currency: 'INR', net_amount: -32040 },
        { source_system: 'ORACLE_GL', txn_date: '2/7/2025 17:26', account_no: 'GL_HL', product_code: 'HL', txn_ref: 'TXN1054326', debit: 69985, credit: 0, currency: 'INR', net_amount: -69985 },
        { source_system: 'ORACLE_GL', txn_date: '2/2/2025 7:40', account_no: 'GL_OTHER', product_code: 'AL', txn_ref: 'TXN1046540', debit: 0, credit: 1998, currency: 'INR', net_amount: 1998 },
        { source_system: 'ORACLE_GL', txn_date: '1/20/2025 4:28', account_no: 'GL_HL', product_code: 'HL', txn_ref: 'TXN1027628', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'ORACLE_GL', txn_date: '2/20/2025 23:22', account_no: 'GL_OTHER', product_code: 'AL', txn_ref: 'TXN1073402', debit: 7928, credit: 8639, currency: 'INR', net_amount: 711 },
        { source_system: 'ORACLE_GL', txn_date: '2/9/2025 8:02', account_no: 'GL_OTHER', product_code: 'PL', txn_ref: 'TXN1056642', debit: 0, credit: 3210, currency: 'INR', net_amount: 3210 },
        { source_system: 'ORACLE_GL', txn_date: '1/30/2025 1:02', account_no: 'GL_OTHER', product_code: 'PL', txn_ref: 'TXN1041822', debit: 0, credit: 2929, currency: 'INR', net_amount: 2929 },
        { source_system: 'ORACLE_GL', txn_date: '3/11/2025 9:46', account_no: 'GL_OTHER', product_code: 'AL', txn_ref: 'TXN1099946', debit: 1525, credit: 9893, currency: 'INR', net_amount: 8368 },
        { source_system: 'ORACLE_GL', txn_date: '1/2/2025 22:01', account_no: 'GL_OTHER', product_code: 'AL', txn_ref: 'TXN1002761', debit: 59097, credit: 0, currency: 'INR', net_amount: -59097 }
      ]
    },
    '/pennant-home': {
      title: 'Pennant Dashboard',
      logo: 'P',
      color: 'bg-purple-600',
      exportUrl: '/autobot/Pennant_LMS.xlsx',
      exportName: 'pennant_data.xlsx',
      data: [
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:00', account_no: 'LOAN000000', product_code: 'AL', txn_ref: 'TXN1000000', debit: 0, credit: 80584, currency: 'INR', net_amount: 80584 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:01', account_no: 'LOAN000001', product_code: 'HL', txn_ref: 'TXN1000001', debit: 5740, credit: 12724, currency: 'INR', net_amount: 6984 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:02', account_no: 'LOAN000002', product_code: 'AL', txn_ref: 'TXN1000002', debit: 8318, credit: 0, currency: 'INR', net_amount: -8318 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:03', account_no: 'LOAN000003', product_code: 'AL', txn_ref: 'TXN1000003', debit: 0, credit: 19160, currency: 'INR', net_amount: 19160 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:04', account_no: 'LOAN000004', product_code: 'HL', txn_ref: 'TXN1000004', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:05', account_no: 'LOAN000005', product_code: 'HL', txn_ref: 'TXN1000005', debit: 6657, credit: 0, currency: 'INR', net_amount: -6657 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:06', account_no: 'LOAN000006', product_code: 'AL', txn_ref: 'TXN1000006', debit: 7810, credit: 0, currency: 'INR', net_amount: -7810 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:07', account_no: 'LOAN000007', product_code: 'PL', txn_ref: 'TXN1000007', debit: 0, credit: 37443, currency: 'INR', net_amount: 37443 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:08', account_no: 'LOAN000008', product_code: 'AL', txn_ref: 'TXN1000008', debit: 0, credit: 49377, currency: 'INR', net_amount: 49377 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:09', account_no: 'LOAN000009', product_code: 'AL', txn_ref: 'TXN1000009', debit: 8976, credit: 89629, currency: 'INR', net_amount: 80653 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:10', account_no: 'LOAN000010', product_code: 'AL', txn_ref: 'TXN1000010', debit: 0, credit: 8501, currency: 'INR', net_amount: 8501 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:11', account_no: 'LOAN000011', product_code: 'AL', txn_ref: 'TXN1000011', debit: 0, credit: 19748, currency: 'INR', net_amount: 19748 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:12', account_no: 'LOAN000012', product_code: 'HL', txn_ref: 'TXN1000012', debit: 0, credit: 16770, currency: 'INR', net_amount: 16770 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:13', account_no: 'LOAN000013', product_code: 'AL', txn_ref: 'TXN1000013', debit: 0, credit: 14131, currency: 'INR', net_amount: 14131 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:14', account_no: 'LOAN000014', product_code: 'PL', txn_ref: 'TXN1000014', debit: 3561, credit: 99804, currency: 'INR', net_amount: 96243 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:15', account_no: 'LOAN000015', product_code: 'HL', txn_ref: 'TXN1000015', debit: 7398, credit: 0, currency: 'INR', net_amount: -7398 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:16', account_no: 'LOAN000016', product_code: 'PL', txn_ref: 'TXN1000016', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'PENNANT', txn_date: '1/1/2025 0:17', account_no: 'LOAN000017', product_code: 'PL', txn_ref: 'TXN1000017', debit: 0, credit: 0, currency: 'INR', net_amount: 0 }
      ]

    },
    '/finnacle-home': {
      title: 'Finacle Dashboard',
      logo: 'F',
      color: 'bg-blue-600',
      exportUrl: '/autobot/Finacle_CBS.xlsx',
      exportName: 'finacle_data.xlsx',
      data: [
        { source_system: 'FINACLE', txn_date: '2026-02-01', account_no: 'LOAN001', product_code: 'HL', txn_ref: 'TXN1001', debit: 0, credit: 100000, currency: 'INR', net_amount: 100000 },
        { source_system: 'FINACLE', txn_date: '2026-02-05', account_no: 'LOAN001', product_code: 'HL', txn_ref: 'TXN1002', debit: 8000, credit: 0, currency: 'INR', net_amount: -8000 },
        { source_system: 'FINACLE', txn_date: '2026-02-05', account_no: 'LOAN001', product_code: 'HL', txn_ref: 'TXN1003', debit: 2000, credit: 0, currency: 'INR', net_amount: -2000 },

        { source_system: 'FINACLE', txn_date: '1/1/2025 0:00', account_no: 'LOAN000000', product_code: 'AL', txn_ref: 'TXN1000000', debit: 0, credit: 80584, currency: 'INR', net_amount: 80584 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:01', account_no: 'LOAN000001', product_code: 'HL', txn_ref: 'TXN1000001', debit: 5740, credit: 12724, currency: 'INR', net_amount: 6984 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:02', account_no: 'LOAN000002', product_code: 'AL', txn_ref: 'TXN1000002', debit: 8318, credit: 0, currency: 'INR', net_amount: -8318 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:03', account_no: 'LOAN000003', product_code: 'AL', txn_ref: 'TXN1000003', debit: 0, credit: 19160, currency: 'INR', net_amount: 19160 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:04', account_no: 'LOAN000004', product_code: 'HL', txn_ref: 'TXN1000004', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:05', account_no: 'LOAN000005', product_code: 'HL', txn_ref: 'TXN1000005', debit: 6657, credit: 0, currency: 'INR', net_amount: -6657 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:06', account_no: 'LOAN000006', product_code: 'AL', txn_ref: 'TXN1000006', debit: 7810, credit: 0, currency: 'INR', net_amount: -7810 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:07', account_no: 'LOAN000007', product_code: 'PL', txn_ref: 'TXN1000007', debit: 0, credit: 37443, currency: 'INR', net_amount: 37443 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:08', account_no: 'LOAN000008', product_code: 'AL', txn_ref: 'TXN1000008', debit: 0, credit: 49377, currency: 'INR', net_amount: 49377 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:09', account_no: 'LOAN000009', product_code: 'AL', txn_ref: 'TXN1000009', debit: 8976, credit: 89629, currency: 'INR', net_amount: 80653 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:10', account_no: 'LOAN000010', product_code: 'AL', txn_ref: 'TXN1000010', debit: 0, credit: 8501, currency: 'INR', net_amount: 8501 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:11', account_no: 'LOAN000011', product_code: 'AL', txn_ref: 'TXN1000011', debit: 0, credit: 19748, currency: 'INR', net_amount: 19748 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:12', account_no: 'LOAN000012', product_code: 'HL', txn_ref: 'TXN1000012', debit: 0, credit: 16770, currency: 'INR', net_amount: 16770 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:13', account_no: 'LOAN000013', product_code: 'AL', txn_ref: 'TXN1000013', debit: 0, credit: 14131, currency: 'INR', net_amount: 14131 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:14', account_no: 'LOAN000014', product_code: 'PL', txn_ref: 'TXN1000014', debit: 3561, credit: 99804, currency: 'INR', net_amount: 96243 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:15', account_no: 'LOAN000015', product_code: 'HL', txn_ref: 'TXN1000015', debit: 7398, credit: 0, currency: 'INR', net_amount: -7398 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:16', account_no: 'LOAN000016', product_code: 'PL', txn_ref: 'TXN1000016', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:17', account_no: 'LOAN000017', product_code: 'PL', txn_ref: 'TXN1000017', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:18', account_no: 'LOAN000018', product_code: 'PL', txn_ref: 'TXN1000018', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'FINACLE', txn_date: '1/1/2025 0:19', account_no: 'LOAN000019', product_code: 'PL', txn_ref: 'TXN1000019', debit: 8862, credit: 91713, currency: 'INR', net_amount: 82851 }
      ]
    },
    '/bank-home': {
      title: 'Bank Dashboard',
      logo: 'B',
      color: 'bg-yellow-600',
      exportUrl: '/autobot/banktxn.xlsx',
      exportName: 'bank_data.xlsx',
      data: [
        { source_system: 'BANK', txn_date: '2026-02-01', account_no: 'LOAN001', product_code: 'HL', txn_ref: 'TXN1001', debit: 0, credit: 100000, currency: 'INR', net_amount: 100000 },
        { source_system: 'BANK', txn_date: '2026-02-05', account_no: 'LOAN001', product_code: 'HL', txn_ref: 'TXN1002', debit: 8000, credit: 0, currency: 'INR', net_amount: -8000 },
        { source_system: 'BANK', txn_date: '2026-02-05', account_no: 'LOAN001', product_code: 'HL', txn_ref: 'TXN1003', debit: 2000, credit: 0, currency: 'INR', net_amount: -2000 },

        { source_system: 'BANK', txn_date: '1/1/2025 0:00', account_no: 'LOAN000000', product_code: 'AL', txn_ref: 'TXN1000000', debit: 0, credit: 80584, currency: 'INR', net_amount: 80584 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:01', account_no: 'LOAN000001', product_code: 'HL', txn_ref: 'TXN1000001', debit: 5740, credit: 12724, currency: 'INR', net_amount: 6984 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:02', account_no: 'LOAN000002', product_code: 'AL', txn_ref: 'TXN1000002', debit: 8318, credit: 0, currency: 'INR', net_amount: -8318 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:03', account_no: 'LOAN000003', product_code: 'AL', txn_ref: 'TXN1000003', debit: 0, credit: 19160, currency: 'INR', net_amount: 19160 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:04', account_no: 'LOAN000004', product_code: 'HL', txn_ref: 'TXN1000004', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:05', account_no: 'LOAN000005', product_code: 'HL', txn_ref: 'TXN1000005', debit: 6657, credit: 0, currency: 'INR', net_amount: -6657 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:06', account_no: 'LOAN000006', product_code: 'AL', txn_ref: 'TXN1000006', debit: 7810, credit: 0, currency: 'INR', net_amount: -7810 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:07', account_no: 'LOAN000007', product_code: 'PL', txn_ref: 'TXN1000007', debit: 0, credit: 37443, currency: 'INR', net_amount: 37443 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:08', account_no: 'LOAN000008', product_code: 'AL', txn_ref: 'TXN1000008', debit: 0, credit: 49377, currency: 'INR', net_amount: 49377 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:09', account_no: 'LOAN000009', product_code: 'AL', txn_ref: 'TXN1000009', debit: 8976, credit: 89629, currency: 'INR', net_amount: 80653 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:10', account_no: 'LOAN000010', product_code: 'AL', txn_ref: 'TXN1000010', debit: 0, credit: 8501, currency: 'INR', net_amount: 8501 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:11', account_no: 'LOAN000011', product_code: 'AL', txn_ref: 'TXN1000011', debit: 0, credit: 19748, currency: 'INR', net_amount: 19748 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:12', account_no: 'LOAN000012', product_code: 'HL', txn_ref: 'TXN1000012', debit: 0, credit: 16770, currency: 'INR', net_amount: 16770 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:13', account_no: 'LOAN000013', product_code: 'AL', txn_ref: 'TXN1000013', debit: 0, credit: 14131, currency: 'INR', net_amount: 14131 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:14', account_no: 'LOAN000014', product_code: 'PL', txn_ref: 'TXN1000014', debit: 3561, credit: 99804, currency: 'INR', net_amount: 96243 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:15', account_no: 'LOAN000015', product_code: 'HL', txn_ref: 'TXN1000015', debit: 7398, credit: 0, currency: 'INR', net_amount: -7398 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:16', account_no: 'LOAN000016', product_code: 'PL', txn_ref: 'TXN1000016', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:17', account_no: 'LOAN000017', product_code: 'PL', txn_ref: 'TXN1000017', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:18', account_no: 'LOAN000018', product_code: 'PL', txn_ref: 'TXN1000018', debit: 0, credit: 0, currency: 'INR', net_amount: 0 },
        { source_system: 'BANK', txn_date: '1/1/2025 0:19', account_no: 'LOAN000019', product_code: 'PL', txn_ref: 'TXN1000019', debit: 8862, credit: 91713, currency: 'INR', net_amount: 82851 }
      ]
    }
  };

  // Fallback to default if path doesn't match
  const config = configMap[location.pathname] || configMap['/oracle-home'];

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = config.exportUrl;
    link.setAttribute('download', config.exportName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    'source_system', 'txn_date', 'account_no', 'product_code',
    'txn_ref', 'debit', 'credit', 'currency', 'net_amount'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded text-white ${config.color}`}>
              <span className="font-bold">{config.logo}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{config.title}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700"><Search className="h-5 w-5" /></button>
            <button className="text-gray-500 hover:text-gray-700"><Bell className="h-5 w-5" /></button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            <button className="sm:hidden text-gray-500"><Menu className="h-6 w-6" /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and view recent transaction data from {config.title}.</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 whitespace-nowrap uppercase tracking-wider text-xs">
                      {col.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  // Skeleton Rows matching exact column count
                  Array.from({ length: 8 }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-4 py-4">
                          <div className={`h-4 animate-pulse rounded bg-gray-200 ${colIndex === 0 ? 'w-24' : 'w-16'}`}></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  // Actual Data Rows
                  config.data.map((row: Transaction, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.source_system}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{row.txn_date}</td>
                      <td className="px-4 py-3 text-gray-700">{row.account_no}</td>
                      <td className="px-4 py-3 text-gray-700">{row.product_code}</td>
                      <td className="px-4 py-3 text-gray-700">{row.txn_ref}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{row.debit > 0 ? row.debit.toLocaleString() : '0'}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{row.credit > 0 ? row.credit.toLocaleString() : '0'}</td>
                      <td className="px-4 py-3 text-gray-500">{row.currency}</td>
                      <td className={`px-4 py-3 text-right font-medium ${row.net_amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {row.net_amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemDashboard;