import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface AddressCardProps {
  type: 'Home' | 'Office' | 'Other';
  name: string;
  phone: string;
  address: string;
}

interface CustomerCardProps {
  customers: AddressCardProps[];
}

const CustomerAddressCard: React.FC<CustomerCardProps> = ({ customers }) => {
  if (!customers || customers.length === 0)
    return <Typography>Loading customer info...</Typography>;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(318px, 1fr))',

        gap: 2,
        alignItems: 'stretch',
        m: 1,
      }}
    >
      {customers.map((customer, index) => (
        <Card
          key={index}
          sx={{
            height: 180,
            minWidth:318,
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <CardContent>
            <Typography variant="h6">Name: {customer.name}</Typography>
            <Typography variant="body2">Phone: {customer.phone}</Typography>
            <Typography variant="body2">Address: {customer.address}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {customer.type}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default CustomerAddressCard;
