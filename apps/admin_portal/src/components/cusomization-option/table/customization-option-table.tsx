import React from 'react';
// import { CustomizationPayload, Option } from 'src/pages/dashboard/customization';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Switch,
} from '@mui/material';
import { PiTrash } from 'react-icons/pi';
import { CustomizationPayload, Option } from 'src/types/customization';

interface CustomizationOptionTableProps {
  customization: CustomizationPayload | null;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (customization: Option) => void; // now editing an option
  onDelete: (id: string) => void;
}

const CustomizationOptionTable: React.FC<CustomizationOptionTableProps> = ({
  customization,
  onToggle,
  onEdit,
  onDelete,
}) => {
  if (!customization) return null; // no customization yet


  return (
    <TableContainer component={Paper} sx={{ maxHeight: 420, overflowY: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Option Name</TableCell>
            <TableCell align="center">Type</TableCell>
            <TableCell align="center">Required</TableCell>
            <TableCell align="center">Choices</TableCell>
            <TableCell align="center">Price Type</TableCell>
            <TableCell align="center">Switch</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
  {customization.options.map((opt) => {
    return (
      <TableRow key={opt._id}>
        <TableCell>{opt.name}</TableCell>
        <TableCell align="center">{opt.type}</TableCell>
        <TableCell align="center">{opt.required ? "Yes" : "No"}</TableCell>
        <TableCell align="center">
          {(opt.choices && opt.choices.length > 0)
            ? opt.choices.map((c) => c.name).join(", ")
            : "-"}
        </TableCell>
        <TableCell align="center">{opt.priceType ?? "-"}</TableCell>
        <TableCell align="center">
          <Switch
            checked={opt.isActive}
            onChange={(e) => onToggle(opt._id, e.target.checked)}
            color="primary"
            size="small"
          />
        </TableCell>
       
      <TableCell align="center">
  <div
    style={{
      display: "flex",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {/* Edit Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      onClick={() => !customization.customizationIsActive && onEdit(opt)}
      style={{
        cursor: customization.customizationIsActive ? "not-allowed" : "pointer",
        opacity: customization.customizationIsActive ? 0.4 : 1,
        pointerEvents: customization.customizationIsActive ? "none" : "auto",
      }}
    >
      <path
        d="M 18 2 L 15.585938 4.4140625 L 19.585938 8.4140625 L 22 6 L 18 2 z 
           M 14.076172 5.9238281 L 3 17 L 3 21 L 7 21 
           L 18.076172 9.9238281 L 14.076172 5.9238281 z"
        fill="#637381"
      />
    </svg>

    {/* Delete Button */}
    <Button
      variant="outlined"
      size="small"
      color="error"
      disabled={customization.customizationIsActive}
      onClick={() =>
        !customization.customizationIsActive && onDelete(opt._id)
      }
      style={{
        minWidth: 28,
        padding: "2px 6px",
        opacity: customization.customizationIsActive ? 0.4 : 1,
        pointerEvents: customization.customizationIsActive ? "none" : "auto",
      }}
    >
      <PiTrash size={16} fill="#FF5630" />
    </Button>
  </div>
</TableCell>



      </TableRow>
    );
  })}
</TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomizationOptionTable;
