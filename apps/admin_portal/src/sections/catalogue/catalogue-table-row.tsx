// @mui
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onToggleActive: VoidFunction;
};

export default function CatalogueTableRow({
  row,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onToggleActive,
}: Props) {
  const { name, description, isActive, products_count } = row;

  const confirm = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover>
        <TableCell>
          <ListItemText
            primary={name}
            secondary={description || 'No description'}
            primaryTypographyProps={{ variant: 'subtitle2' }}
            secondaryTypographyProps={{ variant: 'caption', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell align="center">
            <Label variant="soft" color="info">
                {products_count || 0} Products
            </Label>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={(isActive && 'success') || 'default'}
          >
            {isActive ? 'Active' : 'Hidden'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Button variant="soft" size="small" onClick={onViewRow} startIcon={<Iconify icon="solar:eye-bold" />}>
             View Products
          </Button>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            onToggleActive();
            popover.onClose();
          }}
        >
          <Iconify icon={isActive ? "solar:eye-closed-bold" : "solar:eye-bold"} />
          {isActive ? 'Hide' : 'Activate'}
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Catalogue"
        content="Are you sure you want to delete this catalogue? All products inside will remain but the catalogue will be removed."
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
