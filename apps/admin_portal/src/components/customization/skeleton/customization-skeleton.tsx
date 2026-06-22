import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Button,
  Skeleton,
} from "@mui/material";
import { PiTrash } from "react-icons/pi";
import { useNavigate } from "react-router";
import { CustomizationPayload } from "src/types/customization";

interface CustomizationTableProps {
  customization: CustomizationPayload[] | null;
  loading?: boolean; // Add a loading prop
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (customization: CustomizationPayload) => void;
  onDelete: (id: string) => void;
}

const SKELETON_ROWS = 5; // Number of skeleton rows to show

const CustomizationSkeleton: React.FC<CustomizationTableProps> = ({
  customization,
  loading = false,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 420, overflowY: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="center">Created At</TableCell>
            <TableCell align="center">Updated At</TableCell>
            <TableCell align="center">Switch</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rectangular" width={80} height={30} />
                  </TableCell>
                </TableRow>
              ))
            : customization?.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.customizationName}</TableCell>
                  <TableCell align="center">
                    {new Date(row.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(row.updatedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={row.isActive}
                      onChange={(e) => onToggle(row._id, e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => onDelete(row._id)}
                      style={{ minWidth: 28, padding: "2px 6px" }}
                    >
                      <PiTrash size={16} fill="#FF5630" />
                    </Button>

                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      color="primary"
                      style={{ minWidth: 28, padding: "2px 6px" }}
                      onClick={() => navigate(`/dashboard/customization/${row._id}`)}
                    >
                      Apply
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomizationSkeleton;
