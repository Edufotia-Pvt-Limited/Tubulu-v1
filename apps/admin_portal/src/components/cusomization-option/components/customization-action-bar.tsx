import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

interface ActionBarProps {
  title?: string; // Optional title
  onAdd?: () => void; // Callback for Add New button
  addText?: string; // Text for Add New button, default "Add New"
  customButtons?: React.ReactNode; // Any extra buttons/components you want to render
  customizationActive:boolean;
}

const CustomizationActionBar: React.FC<ActionBarProps> = ({
  
  onAdd,
  addText = "Add New",
  customButtons,
  customizationActive
}) => {
 return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 2,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      
      <Stack
        direction="row"
        spacing={1}
        sx={{ marginLeft: "auto" }} // pushes this stack to the far right
      >
        {customButtons}

        {onAdd && (
          <Button variant="contained" disabled={customizationActive} color="primary" onClick={onAdd}>
            {addText}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default CustomizationActionBar;
