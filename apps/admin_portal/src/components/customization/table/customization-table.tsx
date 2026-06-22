import React from 'react';
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
import { VscCheck } from 'react-icons/vsc';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { CustomizationPayload } from 'src/types/customization';


interface CustomizationTableProps {
  // For now, table body is hardcoded
  customization: CustomizationPayload[] | null;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (customization: CustomizationPayload) => void;
  onDelete: (id: string) => void;
  // onApply: ()
}

const CustomizationTable: React.FC<CustomizationTableProps> = ({customization,onToggle,onEdit,onDelete}) => {

     const navigate = useNavigate();

  
 
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 420, overflowY: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="center">Created At</TableCell>
            <TableCell align="center">Updated At</TableCell>
            <TableCell align="center">Price Type</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {customization?.map((row) => (
            <TableRow key={row._id}>
               
              <TableCell><Link
                                to={`/dashboard/customization/${row._id}`}
                                style={{
                                  display: 'block', // make it behave like a block
                                  width: '100%',
                                  color: '#36F',
                                  textDecoration: 'none',
                                  fontWeight: 500,
                                }}
                              >{row.customizationName}
                                            </Link>
</TableCell>
              <TableCell align="center">
                {new Date(row.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell align="center">
                {new Date(row.updatedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell align='center'>
                {row.options[0]?.priceType ?? "-"}
              </TableCell>
               <TableCell align="center">
                              <Switch
                                checked={row.isActive}
                                onChange={(e) => onToggle(row._id, e.target.checked)}
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
      onClick={(e) => {
        e.stopPropagation();
        if (!row.isActive) onEdit(row);
      }}
      style={{
        cursor: row.isActive ? "not-allowed" : "pointer",
        opacity: row.isActive ? 0.5 : 1,
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
      onClick={(e) => {
        e.stopPropagation();
        if (!row.isActive) onDelete(row._id);
      }}
      disabled={row.isActive}
      style={{
        minWidth: 28,
        padding: "2px 6px",
        opacity: row.isActive ? 0.5 : 1,
        pointerEvents: row.isActive ? "none" : "auto",
      }}
    >
      <PiTrash size={16} fill="#FF5630" />
    </Button>

    {/* Apply Button */}
    <Button
      variant="outlined"
      size="small"
      color="primary"
      onClick={(e) => {
        e.stopPropagation();
        if (!row.isActive)
          navigate(`/dashboard/customization/apply/${row._id}`);
      }}
      disabled={row.isActive}
      style={{
        minWidth: 28,
        padding: "2px 6px",
        opacity: row.isActive ? 0.5 : 1,
        pointerEvents: row.isActive ? "none" : "auto",
      }}
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

export default CustomizationTable;
