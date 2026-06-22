

import React, { useState } from "react";
import { Box, Select, MenuItem, TextField, Button, Menu } from "@mui/material";
import { createSvgIcon } from "@mui/material/utils";
import { ProductType } from "../products/product-table";

const PlusIcon = createSvgIcon(
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>,
  "Plus"
);

type Status = "all" | "pending" | "complete" | "failed";

interface ActionBarProps {
  statusFilter?: Status;
  setStatusFilter?: React.Dispatch<React.SetStateAction<Status>>;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isCatalogueActive?:boolean;
  onCreate?: () => void;
  createLabel?: string;
  searchPlaceholder?: string;
  menuItems?: { label: string; onClick: () => void }[]; 
}

const ActionBar: React.FC<ActionBarProps> = ({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  isCatalogueActive,
  onCreate,
  createLabel = "Create",
  searchPlaceholder = "Search...",
  menuItems, 
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1.5, sm: 2 },
        mb: 2,
        width: "100%",
        px: { xs: 2, sm: 2, md: 1, lg: 0 },
      }}
    >
      {/* Status Filter */}
      {statusFilter !== undefined && setStatusFilter && (

      <Select
        size="medium"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as Status)}
        sx={{
          flex: { xs: "none", sm: 0.5 },
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="pending">In Progress</MenuItem>
        <MenuItem value="complete">Completed</MenuItem>
        <MenuItem value="failed">Failed</MenuItem>
        <MenuItem value="active">Active</MenuItem>
      </Select>
)}

      {/* Search Bar */}
      <TextField
        size="medium"
        variant="outlined"
        placeholder={searchPlaceholder}
        sx={{
          // flex: { xs: "none", sm: 2 },
            flex: statusFilter !== undefined ? { xs: "none", sm: 2 } : 1,
          width: { xs: "100%", sm: "auto" },
          mt: { xs: 1, sm: 0 },
        }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Either Button OR Menu */}
      {menuItems ? (
        <>
          <Button
            sx={{
              background: "#36F",
              color: "#FFF",
              height: 50,
              px: 2,
              fontSize: { xs: "0.875rem", md: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
              mt: { xs: 1, sm: 0 },
              "&:hover": { background: "#36F" },
            }}
            onClick={handleMenuClick}
            variant="contained"
            startIcon={<PlusIcon />}
            disabled={false}

          >
            {createLabel}
          </Button>

          <Menu 
           PaperProps={{
      sx: {
        marginTop:2,
        marginRight:7,
       
        p: 2, // padding inside the menu container
        minWidth: 180, // optional: set minimum width
      
      },
    }} anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            {menuItems.map((item, idx) => (
              <MenuItem
                key={idx}
                onClick={() => {
                  item.onClick();
                  handleMenuClose();
                }}
                 sx={{ py: 1 }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <Button
          sx={{
            background: "#36F",
            color: "#FFF",
            height: 50,
            px: 2,
            fontSize: { xs: "0.875rem", md: "0.9rem" },
            width: { xs: "100%", sm: "auto" },
            mt: { xs: 1, sm: 0 },
            "&:hover": { background: "#36F" },
          }}
          onClick={onCreate}
          variant="contained"
          startIcon={<PlusIcon />}
                       disabled={false}

        >
          {createLabel}
        </Button>
      )}
    </Box>
  );
};

export default ActionBar;
