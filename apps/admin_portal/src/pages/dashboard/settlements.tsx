import { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Box,
  Card,
  Table,
  Divider,
  TableBody,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';
// components
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import { TableNoData, TableHeadCustom, TableSkeleton } from 'src/components/table';
import { axios } from 'src/utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'settlementDate', label: 'Date', width: 160 },
  { id: 'amount', label: 'Amount', width: 140 },
  { id: 'status', label: 'Status', width: 120 },
  { id: 'utr', label: 'UTR / Ref No', width: 200 },
];

// ----------------------------------------------------------------------

export default function MerchantSettlementsPage() {
  const settings = useSettingsContext();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSettlements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/settlements/merchant', {
        params: {
          page,
          size: rowsPerPage,
        },
      });
      if (response.data.success) {
        setTableData(response.data.data);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Payout Settlements
      </Typography>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Table size="medium" sx={{ minWidth: 600 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, i) => <TableSkeleton key={i} />)
                ) : (
                  tableData.map((row: any) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #e9ecee' }}>
                      <td style={{ padding: '16px' }}>
                        {row.settlementDate ? new Date(row.settlementDate).toLocaleDateString() : new Date(row.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>
                        ₹{parseFloat(row.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 0.5,
                            typography: 'caption',
                            fontWeight: 'bold',
                            bgcolor: row.status === 'Success' ? 'success.soft' : row.status === 'Failed' ? 'error.soft' : 'warning.soft',
                            color: row.status === 'Success' ? 'success.dark' : row.status === 'Failed' ? 'error.dark' : 'warning.dark',
                            display: 'inline-block'
                          }}
                        >
                          {row.status}
                        </Box>
                      </td>
                      <td style={{ padding: '16px' }}>{row.utr || '-'}</td>
                    </tr>
                  ))
                )}

                <TableNoData notFound={!loading && tableData.length === 0} />
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Divider />

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
