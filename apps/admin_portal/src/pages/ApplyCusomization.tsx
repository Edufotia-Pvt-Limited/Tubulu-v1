



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
  Tooltip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { MdArrowBack } from "react-icons/md";
import { useDebounce } from "src/hooks/use-debounce";
import {
  getApplyCustomizationDetails,
  searchProductsForCustomization,
  applyCustomizationApi,
} from "src/utils/ApiActions";
import ProductPageSkeleton from "src/components/catalogue/PageSkeleton";
import { AxiosError } from "axios";

// ===== Types =====
interface Choice {
  _id: string;
  name: string;
  priceAdjustment: number;
}
interface Option {
  _id: string;
  name: string;
  type: string;
  required: boolean;
  choices: Choice[];
  isActive: boolean;
  isDeleted: boolean;
  priceType: string;
}
interface Customization {
  _id: string;
  customizationName: string;
  options: Option[];
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
  catalogueId: string;
  category: string;
  subCategory: string;
  quantity: number;
  isActive: boolean;
  customizationId?: string | null;
  matchCustomization: boolean;
  isSelectable: boolean;
}

const PAGE_SIZE = 5;

const ApplyCustomization: React.FC = () => {
  const navigate = useNavigate();
  const { customizationId } = useParams<{ customizationId: string }>();

  // ===== States =====
  const [customization, setCustomization] = useState<Customization | null>(null);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [selectedCatalogue, setSelectedCatalogue] = useState<string>("");

  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [initialMatchedProducts, setInitialMatchedProducts] = useState<string[]>([]);

  const [loadingCustomization, setLoadingCustomization] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [customizationError, setCustomizationError] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  // ===== Fetch customization =====
  useEffect(() => {
    if (!customizationId) return;

    const fetchCustomization = async () => {
      try {
        setLoadingCustomization(true);
        setCustomizationError(false);
        const res = await getApplyCustomizationDetails(customizationId);

        if (!res.data.customization) {
          setCustomizationError(true);
          setCustomization(null);
        } else {
          setCustomization(res.data.customization);
          setCatalogues(res.data.catalogues);
        }
      } catch (err) {
        console.error(err);
        setCustomizationError(true);
        setCustomization(null);
      } finally {
        setLoadingCustomization(false);
      }
    };

    fetchCustomization();
  }, [customizationId]);

  // ===== Fetch products (only when catalogue/search/page changes) =====
  useEffect(() => {
    if (!selectedCatalogue) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        const res = await searchProductsForCustomization(
          selectedCatalogue,
          debouncedSearch,
          page,
          PAGE_SIZE,
          customizationId
        );

        const productsData: ProductType[] = res.products || [];
        const paginationData = res.pagination || { totalPages: 1, page: 1 };

        setProducts(productsData);

        const preSelected = productsData.filter((p) => p.matchCustomization).map((p) => p.productId);
        setSelectedProducts((prev) => Array.from(new Set([...prev, ...preSelected])));
        setInitialMatchedProducts((prev) => Array.from(new Set([...prev, ...preSelected])));

        setTotalPages(paginationData.totalPages);
        setPage(paginationData.page);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedCatalogue, debouncedSearch, page, customizationId]);

  // ===== Handlers =====
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      const selectableProducts = products.filter((p) => p.isSelectable).map((p) => p.productId);
      setSelectedProducts((prev) => Array.from(new Set([...prev, ...selectableProducts])));
    } else {
      setSelectedProducts((prev) =>
        prev.filter((id) => !products.some((p) => p.isSelectable && p.productId === id))
      );
    }
  };

  const handleApplyCustomization = async () => {
    if (!customizationId) return;
    if (!selectedCatalogue) {
      setSnackbar({ open: true, message: "Please select a catalogue.", type: "error" });
      return;
    }

    try {
      setLoadingProducts(true);

      const removedProductIds = initialMatchedProducts.filter((id) => !selectedProducts.includes(id));

      const res = await applyCustomizationApi(customizationId, selectedProducts, selectedCatalogue, removedProductIds);

      setSnackbar({ open: true, message: res.message || "Customization applied successfully!", type: "success" });
      setInitialMatchedProducts(selectedProducts);
      setPage(1); // refresh products
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setSnackbar({ open: true, message: error.response?.data?.message || error.message || "Failed to apply customization", type: "error" });
    } finally {
      setLoadingProducts(false);
    }
  };

  // ===== Render =====
  if (loadingCustomization)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={40} />
      </Box>
    );

  if (customizationError || !customization)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Typography variant="h6" color="textSecondary">
          No customization data found.
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <MdArrowBack size={24} />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          {customization.customizationName}
        </Typography>
      </Stack>

      {/* Customization Options Table */}
      {customization.options.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>Option Name</TableCell>
                  <TableCell>Required</TableCell>
                  <TableCell>Choices</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customization.options.map((option) => (
                  <TableRow key={option._id}>
                    <TableCell>{option.name}</TableCell>
                    <TableCell>{option.required ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {option.choices
                        .map((choice) => {
                          const label =
                            option.priceType === "adjustment" ? `+₹${choice.priceAdjustment}` : `₹${choice.priceAdjustment}`;
                          return `${choice.name} (${label})`;
                        })
                        .join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Catalogue Selector */}
      <Box sx={{ mb: 2 }}>
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

      {/* Product Search */}
      {selectedCatalogue && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <TextField
            label="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            variant="outlined"
          />
        </Box>
      )}

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 430, overflowY: "auto", mb: 2 }}>
        {!selectedCatalogue ? (
          <Box sx={{ p: 4, textAlign: "center", border: "1px dashed grey", m: 2, borderRadius: 2, bgcolor: "grey.50" }}>
            Please select a catalogue first
          </Box>
        ) : loadingProducts ? (
          <ProductPageSkeleton />
        ) : products.length > 0 ? (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <Checkbox
                    checked={
                      products.filter((p) => p.isSelectable).every((p) => selectedProducts.includes(p.productId)) &&
                      products.filter((p) => p.isSelectable).length > 0
                    }
                    onChange={(e) => handleSelectAllProducts(e.target.checked)}
                  />
                </TableCell>
                <TableCell align="center">Image</TableCell>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="center">Category</TableCell>
                <TableCell align="center">Subcategory</TableCell>
                <TableCell align="center">Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const isSelected = selectedProducts.includes(product.productId);
                const isDisabled = !product.isSelectable;

                return (
                  <TableRow key={product.productId}>
                    <TableCell align="center">
                      {isDisabled ? (
                        <Tooltip title="Product already selected for another customization">
                          <span>
                            <Checkbox checked disabled />
                          </span>
                        </Tooltip>
                      ) : (
                        <Checkbox checked={isSelected} onChange={() => handleSelectProduct(product.productId)} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <img
                        src={product.productImages[0]}
                        alt={product.productName}
                        style={{ width: 70, height: 60, borderRadius: 4, opacity: isDisabled ? 0.5 : 1 }}
                      />
                    </TableCell>
                    <TableCell align="center">{product.productName}</TableCell>
                    <TableCell>{product.productDescription}</TableCell>
                    <TableCell align="center">{product.productPrice}</TableCell>
                    <TableCell align="center">{product.quantity}</TableCell>
                    <TableCell align="center">{product.category}</TableCell>
                    <TableCell align="center">{product.subCategory}</TableCell>
                    <TableCell align="center">{product.isActive ? "Yes" : "No"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>No products found.</Box>
        )}
      </TableContainer>

      {/* Apply Button + Pagination */}
      {products.length > 0 && (
        <>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleApplyCustomization}>
              {loadingProducts ? <CircularProgress size={22} color="inherit" /> : "Apply Customization"}
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
          </Box>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplyCustomization;
