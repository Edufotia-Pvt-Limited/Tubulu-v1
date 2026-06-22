import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// components
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
import { deleteCatalogue } from 'src/utils/ApiActions';
import { enqueueSnackbar } from 'notistack';
//
import CatalogueTableRow from '../catalogue-table-row';
import CatalogueNewEditDialog from '../catalogue-new-edit-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Catalogue Name' },
  { id: 'products_count', label: 'Products', width: 140, align: 'center' },
  { id: 'is_active', label: 'Status', width: 120 },
  { id: '', width: 160 },
];

// ----------------------------------------------------------------------

export default function CatalogueListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCatalogue, setCurrentCatalogue] = useState<any | null>(null);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCatalogue(null);
  };

  const fetchCatalogues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(endpoints.catalogues.list);
      // The backend returns { catalogues: [...], pagination: {...} } in response.data.data
      const rawData = response.data.data;
      setTableData(Array.isArray(rawData?.catalogues) ? rawData.catalogues : (Array.isArray(rawData) ? rawData : []));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogues();
  }, [fetchCatalogues]);

  const handleViewRow = (id: string) => {
    router.push(`/catalogue/${id}`);
  };

  const handleEditRow = (row: any) => {
    setCurrentCatalogue(row);
    handleOpenDialog();
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await deleteCatalogue(id);
      enqueueSnackbar('Catalogue deleted');
      fetchCatalogues();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete catalogue', { variant: 'error' });
    }
  };

  const handleToggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await axios.post(endpoints.catalogues.updateStatus, {
        catalogueId: id,
        isActive: !currentStatus,
      });
      enqueueSnackbar(currentStatus ? 'Catalogue hidden' : 'Catalogue activated');
      fetchCatalogues();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update catalogue status', { variant: 'error' });
    }
  }, [fetchCatalogues]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const notFound = !dataFiltered.length && !loading;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Catalogue Management"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Store', href: paths.dashboard.general.store.catalogue },
          { name: 'Catalogue' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenDialog}
          >
            New Catalogue
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row: any) => (
                    <CatalogueTableRow
                      key={row.id}
                      row={row}
                      onViewRow={() => handleViewRow(row.id)}
                      onEditRow={() => handleEditRow(row)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onToggleActive={() => handleToggleActive(row.id, row.isActive)}
                    />
                  ))}

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

      <CatalogueNewEditDialog
        open={openDialog}
        onClose={handleCloseDialog}
        currentCatalogue={currentCatalogue}
        onRefresh={fetchCatalogues}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
}: {
  inputData: any[];
  comparator: (a: any, b: any) => number;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  return inputData;
}
