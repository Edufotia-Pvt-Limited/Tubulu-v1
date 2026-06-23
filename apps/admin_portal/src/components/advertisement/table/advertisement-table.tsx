import React from "react";
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
} from "@mui/material";
import { PiTrash } from "react-icons/pi";
import { Advertisement } from "src/pages/dashboard/advertisement";
import { Box } from "@mui/system";

interface AdvertisementTableProps {
  advertisement: Advertisement[]
  onEdit?: (advertisement: Advertisement) => void;
   onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const AdvertisementTable: React.FC<AdvertisementTableProps> = ({
  advertisement,
  onEdit,
  onToggle,
  onDelete,
}) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 420, overflowY: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
                <TableCell align="left">Advertisement Banner Image</TableCell>

            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Description</TableCell>
            
            <TableCell align="center">Created At</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        {/* ---------------- TABLE BODY ---------------- */}
        <TableBody>
          {advertisement.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell align="center">
  <Box
    sx={{
      width: 180,
      height: 62,
      overflow: "hidden",
      borderRadius: 1.5,
      border: "1px solid #e0e0e0",
    }}
  >
    <img
      src={ad.bannerUrl}
      alt={ad.name}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        display: "block",
      }}
    />
  </Box>
</TableCell>

              <TableCell align="left">{ad.name}</TableCell>

              <TableCell align="left">{ad.description}</TableCell>







              <TableCell align="center">
                {new Date(ad.createdAt).toLocaleDateString()}
              </TableCell>

              <TableCell align="center">
                              <Switch
                                checked={ad.isActive}
                                onChange={(e) => onToggle(ad.id, e.target.checked)}
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
                  {/* EDIT ICON */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    onClick={() => onEdit && onEdit(ad)}
                    style={{ cursor: "pointer" }}
                  >
                    <path
                      d="M 18 2 L 15.585938 4.4140625 L 19.585938 8.4140625 L 22 6 L 18 2 z 
                         M 14.076172 5.9238281 L 3 17 L 3 21 L 7 21 
                         L 18.076172 9.9238281 L 14.076172 5.9238281 z"
                      fill="#637381"
                    />
                  </svg>

                  {/* DELETE BUTTON */}
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => onDelete(ad.id)}
                    style={{ minWidth: 28, padding: "2px 6px" }}
                  >
                    <PiTrash size={16} fill="#FF5630" />
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

export default AdvertisementTable;
