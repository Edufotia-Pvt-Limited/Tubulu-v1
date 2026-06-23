// @mui
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
// components
import Label from 'src/components/label';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  onApproveRow: VoidFunction;
};

export default function IntegrationTableRow({ row, onApproveRow }: Props) {
  const { integrationName, email, phoneNumber, category, isApproved } = row;

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          primary={integrationName}
          primaryTypographyProps={{ variant: 'subtitle2' }}
        />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{email}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{phoneNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{category}</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={(isApproved && 'success') || 'warning'}
        >
          {isApproved ? 'Approved' : 'Pending'}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Button
          size="small"
          variant="outlined"
          color={isApproved ? 'error' : 'success'}
          onClick={onApproveRow}
        >
          {isApproved ? 'Revoke' : 'Approve'}
        </Button>
      </TableCell>
    </TableRow>
  );
}
