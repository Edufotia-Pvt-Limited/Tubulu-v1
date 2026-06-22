import {  Card, CardContent, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'

type emptyStateProduct = {
    title:string,
}

const EmptyProductsCard: React.FC<emptyStateProduct> = ({title}) => {
  return (
   
    <Box sx={{p:3, textAlign: "center",bgcolor: "grey.100"}}>
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: "black"  }}>
          {title}
        </Typography>
        </Box>
        
        
  
  )
}

export default EmptyProductsCard;