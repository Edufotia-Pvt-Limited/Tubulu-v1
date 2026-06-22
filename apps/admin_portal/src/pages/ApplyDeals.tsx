
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  CircularProgress,
  Pagination,
  Snackbar,
  Alert,
  Stack,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { MdArrowBack } from "react-icons/md";
import { useDebounce } from "src/hooks/use-debounce";
import {
  getApplyDealsDetails,
  getDealProductsForApply,
  applyDealsOnProductsApi,
} from "src/utils/ApiActions";
import ProductPageSkeleton from "src/components/catalogue/PageSkeleton";
import { AxiosError } from "axios";

// =================== Types ===================
interface Deal {
  _id: string;
  name: string;
  couponCode: string;
  discountType: string;
  appliesOnProducts?: string[];
}

interface Catalogue {
  _id: string;
  name: string;
}

interface ProductType {
  productId: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  productImages: string[];
  category: string;
  subCategory: string;
  quantity: number;
  isActive: boolean;
  isAppliedToDeal: boolean;
}

// =================== Constants ===================
const PAGE_SIZE = 5;

const ApplyDeals: React.FC = () => {
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();

  // =================== States ===================
  const [deal, setDeal] = useState<Deal | null>(null);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [selectedCatalogue, setSelectedCatalogue] = useState<string>("");

  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [initialAppliedProducts, setInitialAppliedProducts] = useState<string[]>([]);

  const [loadingDeal, setLoadingDeal] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  // =================== Fetch Deal Details (once) ===================
  useEffect(() => {
    if (!dealId) return;

    const fetchDealDetails = async () => {
      try {
        setLoadingDeal(true);
        const res = await getApplyDealsDetails(dealId);
        setDeal(res.data.deal);
        setCatalogues(res.data.catalogues);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingDeal(false);
      }
    };

    fetchDealDetails();
  }, [dealId]);

  // =================== Fetch Products (on catalogue/search/page) ===================
  useEffect(() => {
    if (!selectedCatalogue || !dealId) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        const res = await getDealProductsForApply(
          dealId,
          selectedCatalogue,
          page,
          PAGE_SIZE,
          debouncedSearch
        );

        const productsData: ProductType[] = res.data.products || [];
        setProducts(productsData);

        // Preselect products already applied to deal
        const preSelected = productsData.filter((p) => p.isAppliedToDeal).map((p) => p.productId);
        setSelectedProducts(Array.from(new Set([...selectedProducts, ...preSelected])));
        setInitialAppliedProducts(Array.from(new Set([...initialAppliedProducts, ...preSelected])));

        setTotalPages(res.data.pagination.totalPages);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedCatalogue, debouncedSearch, page, dealId]);

  // =================== Handlers ===================
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(Array.from(new Set([...selectedProducts, ...products.map((p) => p.productId)])));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleApplyDeals = async () => {
    if (!dealId || !selectedCatalogue) return;

    try {
      setLoadingProducts(true);

      const removedProductIds = initialAppliedProducts.filter((id) => !selectedProducts.includes(id));

      const res = await applyDealsOnProductsApi(dealId, selectedProducts, selectedCatalogue, removedProductIds);

      setSnackbar({ open: true, message: res.message || "Deal applied successfully", type: "success" });
      setInitialAppliedProducts(selectedProducts);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to apply deal", type: "error" });
    } finally {
      setLoadingProducts(false);
    }
  };

  // =================== Render ===================
  if (loadingDeal)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={40} />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          Apply Deal : {deal?.name}
        </Typography>
      </Stack>

      {/* Deal Info */}
      {deal && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Deal Name</TableCell>
                  <TableCell>Coupon Code</TableCell>
                  <TableCell>Discount Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{deal.name}</TableCell>
                  <TableCell>{deal.couponCode}</TableCell>
                  <TableCell>{deal.discountType}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Catalogue Selection */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <TextField
          select
          label="Select Catalogue"
          value={selectedCatalogue}
          onChange={(e) => {
            setSelectedCatalogue(e.target.value);
            setPage(1);
          }}
          fullWidth
          sx={{ maxWidth: 250 }}
          variant="outlined"
        >
          {catalogues.map((cat) => (
            <MenuItem key={cat._id} value={cat._id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Search */}
      {selectedCatalogue && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <TextField
            label="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>
      )}

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 430 }}>
        {loadingProducts ? (
          <ProductPageSkeleton />
        ) : products.length > 0 ? (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <Checkbox
                    checked={products.every((p) => selectedProducts.includes(p.productId))}
                    onChange={(e) => handleSelectAllProducts(e.target.checked)}
                  />
                </TableCell>
                <TableCell align="center">Image</TableCell>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell align="center">
                    <Checkbox
                      checked={selectedProducts.includes(product.productId)}
                      onChange={() => handleSelectProduct(product.productId)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <img
                      src={product.productImages[0]}
                      alt={product.productName}
                      style={{ width: 60, height: 60, borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell align="center">{product.productName}</TableCell>
                  <TableCell align="center">₹{product.productPrice}</TableCell>
                  <TableCell align="center">{product.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>No products found</Box>
        )}
      </TableContainer>

      {/* Apply Button + Pagination */}
      {products.length > 0 && (
        <>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleApplyDeals}>
              Apply Deal
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={totalPages}
              color="primary"
              page={page}
              onChange={(_, v) => setPage(v)}
            />
          </Box>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.type}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplyDeals;
