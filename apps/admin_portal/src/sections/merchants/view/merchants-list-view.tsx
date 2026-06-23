import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
// utils
import axios, { endpoints } from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
// types
import { IMerchantItem } from 'src/types/merchant';
//
import MerchantTableRow from '../merchant-table-row';
import MerchantTableToolbar from '../merchant-table-toolbar';
import MerchantDetailsDrawer from '../merchant-details-drawer';
import MerchantEditDialog from '../merchant-edit-dialog';
import { useAuthContext } from 'src/auth/hooks';
import StateAIConfigDialog from '../state-ai-config-dialog';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
];

const TABLE_HEAD = [
  { id: 'integrationName', label: 'Business Name' },
  { id: 'phoneNumber', label: 'Phone', width: 160 },
  { id: 'category', label: 'Category', width: 120 },
  { id: 'type', label: 'Type', width: 120 },
  { id: 'location', label: 'Location', width: 160 },
  { id: 'isActive', label: 'Status', width: 100, align: 'center' },
  { id: 'isApproved', label: 'Verification', width: 120 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export default function MerchantsListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [tableData, setTableData] = useState<IMerchantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState<IMerchantItem | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<IMerchantItem | null>(null);

  const { user } = useAuthContext();
  const [openStateAIConfig, setOpenStateAIConfig] = useState(false);
  const canManageStateKeys = user?.role?.toLowerCase() === 'regional_manager' || user?.role?.toLowerCase() === 'state_manager' || user?.role?.toLowerCase() === 'state_admin';

  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(endpoints.merchants.list, { params: { showAll: 'true' } });
      setTableData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch merchants:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleApproveRow = useCallback(
    async (id: string, isApproved: boolean) => {
      try {
        await axios.post(endpoints.admin.approve, { integrationId: id, isApproved });
        fetchMerchants();
        if (selectedMerchant?.id === id) {
          setSelectedMerchant((prev: any) => ({ ...prev, isApproved }));
        }
        enqueueSnackbar(
          isApproved ? 'Vendor approved successfully' : 'Vendor approval revoked',
          { variant: 'success' }
        );
      } catch (error: any) {
        console.error('Failed to update merchant:', error);
        enqueueSnackbar(error?.message || 'Failed to update approval status', { variant: 'error' });
      }
    },
    [enqueueSnackbar, fetchMerchants, selectedMerchant]
  );

  const handleSuspendRow = useCallback(
    async (id: string, isSuspended: boolean) => {
      try {
        await axios.post(endpoints.admin.suspend, { integrationId: id, isSuspended });
        fetchMerchants();
        if (selectedMerchant?.id === id) {
          setSelectedMerchant((prev: any) => ({ ...prev, isSuspended }));
        }
        enqueueSnackbar(
          isSuspended ? 'Vendor suspended' : 'Vendor unsuspended',
          { variant: 'success' }
        );
      } catch (error: any) {
        console.error('Failed to suspend merchant:', error);
        enqueueSnackbar(error?.message || 'Failed to update suspension status', { variant: 'error' });
      }
    },
    [enqueueSnackbar, fetchMerchants, selectedMerchant]
  );

  const handleViewRow = useCallback((row: IMerchantItem) => {
    setSelectedMerchant(row);
    setOpenDrawer(true);
  }, []);

  const handleEditRow = useCallback((row: IMerchantItem) => {
    setEditingMerchant(row);
    setOpenEditDialog(true);
  }, []);

  const handleUpdateMerchant = useCallback(
    async (updatedMerchant: IMerchantItem) => {
      setTableData((prev) => prev.map((item) => (item.id === updatedMerchant.id ? updatedMerchant : item)));
      setOpenEditDialog(false);
      setEditingMerchant(null);

      try {
        await axios.post(endpoints.admin.update, updatedMerchant);
        fetchMerchants();
      } catch (error) {
        console.error('Failed to update merchant details:', error);
      }
    },
    [fetchMerchants]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await axios.delete(endpoints.admin.delete(id));
        setTableData((prev) => prev.filter((item) => item.id !== id));
        // Close drawer if the deleted vendor is currently open
        if (selectedMerchant?.id === id) {
          setOpenDrawer(false);
          setSelectedMerchant(null);
        }
        enqueueSnackbar('Vendor deleted successfully', { variant: 'success' });
        fetchMerchants();
      } catch (error: any) {
        console.error('Failed to delete vendor:', error);
        enqueueSnackbar(
          error?.message || 'Failed to delete vendor. Please try again.',
          { variant: 'error' }
        );
      }
    },
    [enqueueSnackbar, fetchMerchants, selectedMerchant]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      setFilterStatus(newValue);
    },
    [table]
  );

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      table.onResetPage();
      setFilterName(event.target.value);
    },
    [table]
  );

  const handleFilterCategory = useCallback(
    (event: SelectChangeEvent<string>) => {
      table.onResetPage();
      setFilterCategory(event.target.value);
    },
    [table]
  );

  const categories = ['all', ...Array.from(new Set(tableData.map((item) => item.category || 'Uncategorized')))];

  const dataFiltered = groupBranchesUnderHQs(
    applyFilter({
      inputData: tableData,
      comparator: getComparator(table.order, table.orderBy),
      filterStatus,
      filterName,
      filterCategory,
      filterType,
    })
  );

  const notFound = !dataFiltered.length && !loading;

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Vendor Management"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Vendor Management' },
          ]}
          action={
            <Stack direction="row" spacing={1.5}>
              {canManageStateKeys && (
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:settings-bold" />}
                  onClick={() => setOpenStateAIConfig(true)}
                >
                  State AI Keys
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => router.push(paths.dashboard.merchants.onboard)}
              >
                Onboard Vendor
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={filterStatus}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filterStatus) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'approved' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && tableData.length}
                    {tab.value === 'approved' &&
                      tableData.filter((item) => item.isApproved).length}
                    {tab.value === 'pending' &&
                      tableData.filter((item) => !item.isApproved).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <MerchantTableToolbar
            filterName={filterName}
            onFilterName={handleFilterName}
            categoryOptions={categories}
            filterCategory={filterCategory}
            onFilterCategory={handleFilterCategory}
            filterType={filterType}
            onFilterType={setFilterType}
            counts={{
              all: tableData.length,
              hq: tableData.filter((item) => !item.parentId).length,
              branches: tableData.filter((item) => item.parentId).length,
            }}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={0}
                  onSort={table.onSort}
                />

                <TableBody>
                  {loading ? (
                    <TableEmptyRows height={72} emptyRows={5} />
                  ) : (
                    dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <MerchantTableRow
                          key={row.id}
                          row={row}
                          onViewRow={() => handleViewRow(row)}
                          onEditRow={() => handleEditRow(row)}
                          onApproveRow={() => handleApproveRow(row.id, !row.isApproved)}
                          onSuspendRow={() => handleSuspendRow(row.id, !row.isSuspended)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                        />
                      ))
                  )}

                  <TableEmptyRows
                    height={table.dense ? 52 : 72}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <MerchantDetailsDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        merchant={selectedMerchant}
        onApprove={handleApproveRow}
        onSuspend={handleSuspendRow}
        onRefresh={fetchMerchants}
      />

      <MerchantEditDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        merchant={editingMerchant}
        allMerchants={tableData.filter((m) => !m.parentId)} // Only non-branches can be parents
        onUpdate={handleUpdateMerchant}
      />

      <StateAIConfigDialog
        open={openStateAIConfig}
        onClose={() => setOpenStateAIConfig(false)}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function groupBranchesUnderHQs(merchants: IMerchantItem[]): IMerchantItem[] {
  const ids = new Set(merchants.map((m) => m.id));
  const hqs = merchants.filter((m) => !m.parentId || !ids.has(m.parentId));
  const branches = merchants.filter((m) => m.parentId && ids.has(m.parentId));

  const result: IMerchantItem[] = [];

  hqs.forEach((hq) => {
    result.push(hq);
    const hqBranches = branches.filter((b) => b.parentId === hq.id);
    result.push(...hqBranches);
  });

  const addedIds = new Set(result.map((m) => m.id));
  const remaining = merchants.filter((m) => !addedIds.has(m.id));
  result.push(...remaining);

  return result;
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterStatus,
  filterName,
  filterCategory,
  filterType,
}: {
  inputData: IMerchantItem[];
  comparator: (a: any, b: any) => number;
  filterStatus: string;
  filterName: string;
  filterCategory: string;
  filterType: string;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  // HIDE INACTIVE / DEACTIVATED DUPLICATES
  inputData = inputData.filter((item) => item.isActive !== false);

  if (filterStatus !== 'all') {
    inputData = inputData.filter(
      (item) =>
        (filterStatus === 'approved' && item.isApproved) ||
        (filterStatus === 'pending' && !item.isApproved)
    );
  }

  if (filterType === 'hq') {
    inputData = inputData.filter((item) => !item.parentId);
  } else if (filterType === 'branches') {
    inputData = inputData.filter((item) => !!item.parentId);
  }

  if (filterName) {
    inputData = inputData.filter(
      (item) =>
        (item.integrationName && item.integrationName.toLowerCase().includes(filterName.toLowerCase())) ||
        (item.phoneNumber && item.phoneNumber.toLowerCase().includes(filterName.toLowerCase()))
    );
  }

  if (filterCategory !== 'all') {
    inputData = inputData.filter((item) => (item.category || 'Uncategorized') === filterCategory);
  }

  return inputData;
}
