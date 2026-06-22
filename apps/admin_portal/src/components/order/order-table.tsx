
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  Select,
  Typography,
  Tooltip,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
} from '@mui/material';
import { MdMessage } from 'react-icons/md';
import { Order } from 'src/pages/dashboard/order';
import { baseUrl } from 'src/utils/ApiActions';

type OrderStatus = 'waiting' | 'accepted' | 'packing' | 'dispatched' | 'delivered' | 'canceled';

const statusMap: Record<string, OrderStatus> = {
  waiting: 'waiting',
  accepted: 'accepted',
  dispatched: 'dispatched',
  delivered: 'delivered',
  canceled: 'canceled',
  packing: 'packing',
};


export interface ItemNote {
  name: string;
  specialRequest: string;
}



interface OrderTableProps {
  orders: Order[];
  onStatusChange?: (id: string, status: Order['orderStatus']) => void;
  showDropdown?: boolean;
}

const formatOrderId = (id: string) => {
  if (!id) return;
  return `${id.slice(0, 3)}-${id.slice(6, 10)}-${id.slice(12, 15)}-${id.slice(-3)}`;
};

const OrderTable: React.FC<OrderTableProps> = ({ orders, onStatusChange, showDropdown }) => {
  // 🟩 Track which order's modal is open
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 420, overflowY: 'auto' }}>
      <Table sx={{ minWidth: 700 }} stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Items</TableCell>
            <TableCell>Payment Details</TableCell>
            <TableCell>Contact Details</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Message</TableCell>
            <TableCell align="center">Order Date</TableCell>
            <TableCell align="center">Delivery Type</TableCell>
            <TableCell align="center">Receipt</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const hasOrderNote = Boolean(order.orderMessage);
            const hasItemNotes = Array.isArray(order.itemsWithNotes) && order.itemsWithNotes.length > 0;
            const itemsToShow = order.itemsWithNotes?.slice(0, 1) || [];
            const remainingCount = (order.itemsWithNotes?.length || 0) - itemsToShow.length;

            return (
              <TableRow key={order.orderId}>
                {/* ITEMS */}
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      maxHeight: order.products.length > 5 ? "130px" : "none",
                      overflowY: order.products.length > 5 ? "scroll" : "visible",
                      pr: 1,

                      // Always show scrollbar
                      "&::-webkit-scrollbar": {
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "#f0f0f0",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#c0c0c0",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: "#a0a0a0",
                      },
                    }}
                  >
                    {Array.isArray(order.products) ? (
                      order.products.map((product, idx) => {
                        const truncatedName =
                          product.name.length > 20
                            ? product.name.substring(0, 20) + "..."
                            : product.name;

                        return (
                          <Tooltip
                            key={idx}
                            placement="right"
                            arrow
                            sx={{
                              "& .MuiTooltip-tooltip": {
                                backgroundColor: "#ffffff",
                                color: "#333",
                                padding: "10px 12px",
                                boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "0.85rem",
                                maxWidth: 250,
                              },
                              "& .MuiTooltip-arrow": {
                                color: "#ffffff",
                              },
                            }}
                            title={
                              <Box>
                                {/* Product Name */}
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    mb: 1,
                                    color: "#d4a017",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {product.name}
                                </Typography>

                                {/* Separator */}
                                <Box
                                  sx={{
                                    height: "1px",
                                    backgroundColor: "#e5e5e5",
                                    width: "100%",
                                    mb: 1,
                                  }}
                                />

                                {/* Customizations */}
                                {Array.isArray(product.customizationDetails) &&
                                  product.customizationDetails.length > 0 ? (
                                  product.customizationDetails.map((c, cIdx) => (
                                    <Box key={cIdx} sx={{ mb: 0.7 }}>
                                      <Typography
                                        component="span"
                                        sx={{
                                          fontWeight: 600,
                                          color: "white",
                                          fontSize: "0.85rem",
                                        }}
                                      >
                                        {c.optionName}:
                                      </Typography>{" "}
                                      <Typography
                                        component="span"
                                        sx={{ color: "#17d423", fontSize: "0.85rem" }}
                                      >
                                        {Array.isArray(c.choiceName)
                                          ? c.choiceName.join(", ")
                                          : c.choiceName}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography sx={{ fontStyle: "italic", color: "#777" }}>
                                    No customizations
                                  </Typography>
                                )}
                              </Box>
                            }
                          >
                            <Typography
                              sx={{
                                color: "#1976d2",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                fontWeight: 500,
                                fontSize: "0.9rem",
                                textDecoration: "none",
                              }}
                            >
                              {truncatedName} (x{product.quantity})
                            </Typography>
                          </Tooltip>
                        );
                      })
                    ) : (
                      <div>{order.products}</div>
                    )}
                  </Box>
                </TableCell>

                {/* PAYMENT DETAILS */}
                <TableCell style={{ whiteSpace: 'nowrap' }}>
                  <div>Payment Type: {order.payment?.method || "—"}</div>
                  <div>Payment Value: {order.payment?.value ?? "—"}</div>
                  <div>Payment Status: {order.payment?.status ?? "—"}</div>
                </TableCell>

                {/* CONTACT DETAILS */}
                <TableCell align="left" sx={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                  {order.customer ? (
                    <>
                      <div>Name: {order.customer.name || "—"}</div>
                      <div>Phone: {order.customer.phone || "—"}</div>
                      <div>
                        Address: {order.customer.address?.addressLine1 || "—"}
                        {order.customer.address?.addressLine2 ? `, ${order.customer.address.addressLine2}` : ""}
                        <br />
                        {order.customer.address?.city || "—"},{" "}
                        {order.customer.address?.pincode || "—"}
                      </div>
                    </>
                  ) : (
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      No Contact Info
                    </Typography>
                  )}
                </TableCell>

                {/* STATUS */}
                <TableCell align="center" sx={{ width: 160 }}>
                  {showDropdown ? (
                    <Select
                      size="small"
                      value={order.orderStatus ? order.orderStatus.toLowerCase() : 'unknown'}
                      onChange={(e) => onStatusChange?.(order.orderId, e.target.value as OrderStatus)}
                      sx={{ minWidth: '120px' }}
                    >
                      <MenuItem value="waiting">Waiting</MenuItem>
                      <MenuItem value="accepted">Accepted</MenuItem>
                      <MenuItem value="packing">Packing</MenuItem>
                      <MenuItem value="dispatched">Dispatched</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem 
                        value="canceled"
                        disabled={['packing', 'dispatched', 'delivered'].includes(order.orderStatus?.toLowerCase() || '')}
                      >
                        Canceled
                      </MenuItem>
                    </Select>
                  ) : (
                    <Typography>{order.orderStatus}</Typography>
                  )}
                </TableCell>

                {/* MESSAGE */}
                <TableCell align="center">
                  {hasOrderNote || hasItemNotes ? (
                    <Stack direction="column" spacing={0.5} alignItems="center">
                      {/* Order-level note */}
                      {hasOrderNote && (
                        <Tooltip
                          title={
                            <Box sx={{ p: 1, maxWidth: 250 }}>
                              <Typography variant="subtitle2">Order Note:</Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'normal' }}>
                                {order.orderMessage}
                              </Typography>
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <Chip
                            icon={<MdMessage size={18} />}
                            label="Order Note"
                            color="warning"
                            size="small"
                            sx={{ cursor: 'pointer' }}
                          />
                        </Tooltip>
                      )}

                      {/* Product-level notes */}
                      {itemsToShow.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                            mb: 0.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {item.name}:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {item.specialRequest}
                          </Typography>
                        </Box>
                      ))}

                      {/* View More button */}
                      {remainingCount > 0 && (
                        <Button
                          size="small"
                          onClick={() => setOpenOrderId(order.orderId)}
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          View {remainingCount} more
                        </Button>
                      )}
                    </Stack>
                  ) : (
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>—</Typography>
                  )}
                </TableCell>

                {/* ORDER DATE */}
                <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  {new Date(order.orderDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>

                {/* DELIVERY TYPE */}
                <TableCell align="center">
                  {order.deliveryType ? (
                    <Typography>{order.deliveryType}</Typography>
                  ) : (
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>—</Typography>
                  )}
                </TableCell>

                {/* RECEIPT LINKS */}
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <Button
                    variant="text"
                    size="small"
                    component="a"
                    href={`${baseUrl}/public/receipt/${order.orderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textTransform: 'none', fontSize: '0.8rem', display: 'block' }}
                  >
                    View HTML
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* 🔹 Shared Modal for "View More" */}
      {openOrderId && (
        <Dialog open={!!openOrderId} onClose={() => setOpenOrderId(null)} maxWidth="sm" fullWidth>
          <DialogTitle>All Product Notes</DialogTitle>
          <DialogContent dividers>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Special Request</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders
                  .find((o) => o.orderId === openOrderId)
                  ?.itemsWithNotes?.map((item, idx) => (
                    <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? 'grey.50' : 'white' }}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell sx={{ whiteSpace: 'normal' }}>{item.specialRequest}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOrderId(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </TableContainer>
  );
};

export default OrderTable;

