import {
  Button,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { PiTrash } from 'react-icons/pi';
import { useNavigate } from 'react-router';
import { Deal } from 'src/types/deals';
// import StarRateIcon from '@mui/icons-material/StarRate';

interface DealTableProps {
  deals: Deal[];
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onChecked: (id: string, isDealOfTheDay: boolean) => void;
}

const DealsTable: React.FC<DealTableProps> = ({ deals, onToggle, onEdit, onDelete, onChecked }) => {
  const navigate = useNavigate();

  function getValidityPeriod(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) return 'N/A';

    const start = Date.parse(startDate);
    const end = Date.parse(endDate);

    if (isNaN(start) || isNaN(end)) return 'Invalid Dates';

    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) return 'Invalid Range';

    if (diffHours >= 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `Valid for ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }

    const roundedHours = Math.round(diffHours);
    return `Valid for ${roundedHours} hour${roundedHours > 1 ? 's' : ''}`;
  }

  const renderDiscountValue = (deal: Deal) => {
    switch (deal.discountType) {
      case 'percentage':
        return deal.discountValue ? `${deal.discountValue}%` : '-';
      case 'flat':
        return deal.discountValue ? `₹${deal.discountValue}` : '-';
      case 'bogo':
        return `Buy ${deal.buyQuantity || 0} Get ${deal.getQuantity || 0}`;
      default:
        return '-';
    }
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 420, overflowY: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center">Deal of The Day</TableCell>
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Descriptions</TableCell>
            <TableCell align="center">Discount Type</TableCell>
            <TableCell align="center">Discount Value</TableCell>
            <TableCell align="center">Validity</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {deals.map((deal) => (
            <TableRow
              key={deal._id}
              sx={{
                backgroundColor: deal.isDealOfTheDay ? 'rgba(33,150,243, .15)' : 'inherit',
              }}
            >
              <TableCell align="center">
                <Tooltip
                  title={deal.isDealOfTheDay ? 'Remove Deal of the Day' : 'Mark as Deal of the Day'}
                >
                  <Switch
                    checked={deal.isDealOfTheDay}
                    onChange={(e) => onChecked(deal._id, e.target.checked)}
                    color="primary"
                    size="small"
                  />
                </Tooltip>
              </TableCell>
              <TableCell align="left">{deal.name}</TableCell>

              <TableCell align="left">
                {deal.descriptions?.length ? deal.descriptions.join(', ') : 'N/A'}
              </TableCell>

              <TableCell align="center">{deal.discountType.toUpperCase()}</TableCell>

              <TableCell align="center">{renderDiscountValue(deal)}</TableCell>

              <TableCell align="center">
                {getValidityPeriod(deal.startDate, deal.endDate)}
              </TableCell>

              <TableCell align="center">
                <Switch
                  checked={deal.isActive}
                  onChange={(e) => onToggle(deal._id, e.target.checked)}
                  color="primary"
                  size="small"
                />
              </TableCell>

              {/* <TableCell align="center">
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    cursor: 'pointer',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    onClick={() => onEdit(deal)}
                    style={{ cursor: 'pointer' }}
                  >
                    <path
                      d="M 18 2 L 15.585938 4.4140625 L 19.585938 8.4140625 L 22 6 L 18 2 z 
                         M 14.076172 5.9238281 L 3 17 L 3 21 L 7 21 
                         L 18.076172 9.9238281 L 14.076172 5.9238281 z"
                      fill="#637381"
                    />
                  </svg>

                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => onDelete(deal._id)}
                    style={{ minWidth: 28, padding: '2px 6px' }}
                    
                  >
                    <PiTrash size={16} />
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    style={{ minWidth: 28, padding: '2px 6px' }}
                    onClick={() => navigate(`/dashboard/deals/apply/${deal._id}`)}
                  >
                    Apply
                  </Button>
                </div>
              </TableCell> */}
              <TableCell align="center">
  <div
    style={{
      display: "flex",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      opacity: deal.isActive ? 0.4 : 1,           // faded when active (disabled)
      pointerEvents: deal.isActive ? "none" : "auto", // disable when active
    }}
  >
    {/* EDIT ICON */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      onClick={() => onEdit(deal)}
      style={{
        cursor: deal.isActive ? "not-allowed" : "pointer",
      }}
    >
      <path
        d="M 18 2 L 15.585938 4.4140625 L 19.585938 8.4140625 L 22 6 L 18 2 z 
           M 14.076172 5.9238281 L 3 17 L 3 21 L 7 21 
           L 18.076172 9.9238281 L 14.076172 5.9238281 z"
        fill="#637381"
      />
    </svg>

    {/* DELETE */}
    <Button
      variant="outlined"
      size="small"
      color="error"
      onClick={() => onDelete(deal._id)}
      style={{ minWidth: 28, padding: "2px 6px" }}
      disabled={deal.isActive} // EXTRA SAFETY but optional
    >
      <PiTrash size={16} />
    </Button>

    {/* APPLY */}
    <Button
      variant="outlined"
      size="small"
      color="primary"
      style={{ minWidth: 28, padding: "2px 6px" }}
      onClick={() => navigate(`/dashboard/deals/apply/${deal._id}`)}
      disabled={deal.isActive} // EXTRA SAFETY
    >
      Apply
    </Button>
  </div>
</TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DealsTable;
