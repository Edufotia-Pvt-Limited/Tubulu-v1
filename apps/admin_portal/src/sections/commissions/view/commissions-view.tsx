import { useState, useCallback, useEffect } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Container,
  TableBody,
  Typography,
  TableContainer,
} from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
// utils
import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
// components
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'date', label: 'Date' },
  { id: 'description', label: 'Description' },
  { id: 'vendor', label: 'Vendor' },
  { id: 'amount', label: 'Amount' },
  { id: 'status', label: 'Status' },
];

// ----------------------------------------------------------------------

export default function CommissionsView() {
  const table = useTable();
  const settings = useSettingsContext();

  const [tableData, setTableData] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCommissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/commissions');
      setTableData(response.data.data.settlements || []);
      setTotalEarned(response.data.data.totalEarned || 0);
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="My Commissions"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Commissions' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack
        direction="row"
        spacing={3}
        sx={{ mb: 5 }}
      >
        <Card sx={{ p: 3, flexGrow: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="subtitle2">Total Earned</Typography>
          <Typography variant="h3">{fCurrency(totalEarned)}</Typography>
        </Card>
      </Stack>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {tableData
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{fDateTime(row.createdAt)}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.metadata?.vendorName || 'N/A'}</TableCell>
                      <TableCell>{fCurrency(row.amount)}</TableCell>
                      <TableCell>
                        <Label
                          variant="soft"
                          color={
                            (row.status === 'paid' && 'success') ||
                            (row.status === 'pending' && 'warning') ||
                            'error'
                          }
                        >
                          {row.status}
                        </Label>
                      </TableCell>
                    </TableRow>
                  ))}

                <TableEmptyRows
                  height={table.dense ? 52 : 72}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                />

                <TableNoData notFound={!loading && !tableData.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={tableData.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}
