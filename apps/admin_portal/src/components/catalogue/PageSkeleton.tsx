import React from "react";
import { Paper, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

const ProductPageSkeleton: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><Skeleton variant="text" width={100} /></TableCell>
            <TableCell><Skeleton variant="text" width={140} /></TableCell>
            <TableCell><Skeleton variant="text" width={120} /></TableCell>
            <TableCell><Skeleton variant="text" width={80} /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(6)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton variant="circular" width={24} height={24} /></TableCell>
              <TableCell><Skeleton variant="rectangular" width={180} height={20} /></TableCell>
              <TableCell><Skeleton variant="rectangular" width={100} height={20} /></TableCell>
              <TableCell><Skeleton variant="rectangular" width={60} height={20} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default ProductPageSkeleton;
