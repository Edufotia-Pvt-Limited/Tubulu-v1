import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';

import type { Catalogue } from 'src/types/catalogue';
import { PiTrash } from 'react-icons/pi';

interface CatalogueTableProps {
 
  catalogs: Catalogue[];
  onToggle: (id: string, isActive: boolean) => void;
  onStatusChange: (id: string, status: Catalogue['status']) => void;
  onEdit: (catalog: Catalogue) => void;
  onDelete: (id: string) => void;
  onImport: (id: string) => void;
  onSwiggyImport: (id: string) => void;
}

const CatalogueTable: React.FC<CatalogueTableProps> = ({
  catalogs,
  onToggle,
  onStatusChange,
  onEdit,
  onDelete,
  onImport,
  onSwiggyImport,
}) => {

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 420, overflowY: 'auto' }}>
      <Table stickyHeader sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell>Catalog Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="center">Product Count</TableCell>
            <TableCell align="center">Created At</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {catalogs.map((catalog) => (
            <TableRow key={catalog.id}>
              <TableCell align="center">
                <Switch
                  checked={catalog.active}
                  onChange={(e) => onToggle(catalog.id, e.target.checked)}
                  color="primary"
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Link to={`/catalogue/${catalog.id}`} style={{ color: '#36F' }}>
                  {catalog.name}
                </Link>
              </TableCell>

              <TableCell>{catalog.description}</TableCell>
              <TableCell align="center">
                {(catalog.products || []).filter((p: any) => !p?.isDeleted).length}
              </TableCell>

              <TableCell align="center">
                {catalog.createdAt
                  ? new Date(catalog.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </TableCell>

              <TableCell align="center">{catalog.status}</TableCell>
            <TableCell align="center">
  <div
    style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Edit Icon (SVG) */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      onClick={() => {
        if (!catalog.active) onEdit(catalog);
      }}
      style={{
        cursor: catalog.active ? 'not-allowed' : 'pointer',
        opacity: catalog.active ? 0.5 : 1,
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
      onClick={() => {
        if (!catalog.active) onDelete(catalog.id);
      }}
      style={{
        minWidth: 28,
        padding: '2px 6px',
        opacity: catalog.active ? 0.5 : 1,
        cursor: catalog.active ? 'not-allowed' : 'pointer',
      }}
      disabled={catalog.active}
    >
      Delete
    </Button>

    {/* Import Button */}
    <Button
      variant="soft"
      size="small"
      color="info"
      onClick={() => onImport(catalog.id)}
      style={{
        minWidth: 28,
        padding: '2px 6px',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 256 256"
      >
        <path
          fill="#00B8D9"
          d="M238 136v64a14 14 0 0 1-14 14H32a14 14 0 0 1-14-14v-64a14 14 0 0 1 14-14h16a6 6 0 0 1 0 12H32a2 2 0 0 0-2 2v64a2 2 0 0 0 2 2h192a2 2 0 0 0 2-2v-64a2 2 0 0 0-2-2h-16a6 6 0 0 1 0-12h16a14 14 0 0 1 14 14M123.76 33.76a6 6 0 0 0-8.48 0l-40 40a6 6 0 0 0 8.48 8.48L114 52.49V152a6 6 0 0 0 12 0V52.49l30.24 30.25a6 6 0 0 0 8.48-8.48Z"
        />
      </svg>
    </Button>

    {/* Swiggy Import Button */}
    <Button
      variant="soft"
      size="small"
      color="warning"
      onClick={() => onSwiggyImport(catalog.id)}
      style={{
        minWidth: 28,
        padding: '2px 6px',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 512 512"
      >
        <path
          fill="#FC8019"
          d="M256 0c141.4 0 256 114.6 256 256s-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0m102.7 151.1l-14.7 13.9c-14.5-16.7-34.9-27.4-58-27.4c-42.5 0-77 34.5-77 77s34.5 77 77 77c23.1 0 43.5-10.7 58-27.4l14.7 13.9c-19.1 21.6-46.6 35.5-77.7 35.5c-54.7 0-99-44.3-99-99s44.3-99 99-99c31.1 0 58.6 13.9 77.7 35.5"
        />
      </svg>
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

export default CatalogueTable;
