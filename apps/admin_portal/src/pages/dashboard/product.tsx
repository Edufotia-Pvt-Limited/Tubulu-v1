import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Pagination,
  Stack,
  IconButton
} from "@mui/material";
import { useParams } from "react-router";
import {
  deleteProduct,
  searchProductsApi,
  updateCatalogue,
  updateProductStatus,
} from "src/utils/ApiActions";
import ActionBar from "src/components/catalogue/action-bar";
import ProductTable from "src/components/products/product-table";
import DeleteConfirmationDialog from "src/components/catalogue/delete-dialog-confirmation";
import { enqueueSnackbar } from "notistack";
import { useDebounce } from "src/hooks/use-debounce";
import ProductPageSkeleton from "src/components/catalogue/PageSkeleton";
import { useNavigate } from "react-router-dom";
import ProductUploadDialog from "src/components/products/product-upload-dialog";
import EmptyProductsCard from "src/components/products/empty-products-card";
import { MdArrowBack } from "react-icons/md";
import { AxiosError } from "axios";

type CatalogueId = { id: string };

type ProductType = {
  productId: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  productCurrency: string;
  productImages: string[];
  catalogueName: string;
  catalogueId: string;
  catalogueDescription: string;
  catalogueIsActive:boolean;
  quantity: number;
  isActive: boolean;
  subCategory: string;
    foodType:string;
  category: string;
};
type Status = "all" | "pending" | "complete" | "failed";

const PAGE_SIZE = 5;

const ProductPage: React.FC = () => {
  const { id } = useParams<CatalogueId>();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [catName, setCatalogueName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isCatalogueActive, setIsCatalogueActive] = useState(false);
  const [integrationCategory, setIntegrationCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const navigate = useNavigate();

  const handleAddSingle = () => {
    navigate(`/catalogue/product/create/${id}`, {
      state: { catName, integrationCategory },
    });
  };

  // Fetch/Search Products (backend pagination)
  const fetchProducts = async (query?: string, pageNum: number = 1) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await searchProductsApi(id, query || "", pageNum, PAGE_SIZE);

      setProducts(res.products);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || 1);

      if (res.products.length > 0) {
        setCatalogueName(res.products[0].catalogueName);
        setIntegrationCategory(res.products[0].integrationCategory);
        setIsCatalogueActive(res.products[0].catalogueIsActive ?? true);
      }

    } catch (err) {
      setProducts([]);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(debouncedSearch, 1); // reset to page 1 on search change
    console.log("-->",integrationCategory);
  }, [id, debouncedSearch]);

  // Upload Products
  const handleUploadProducts = async (file: File) => {
    if (!id) return;
    try {
      const formData = new FormData();
      formData.append("csvFile", file);
      formData.append("mode", "append");

      await updateCatalogue(id, formData);

      enqueueSnackbar("Products appended successfully", {
        variant: "success",
      });
      fetchProducts(debouncedSearch, page);
    } catch (error) {
    const err = error as AxiosError<{ message?: string }>;

    console.error("Upload error:", err);

    enqueueSnackbar(
      err.response?.data?.message || err.message || "Failed to append products",
      {
        variant: "error",
      }
    );
  }
  };

  const handleToggle = async (
    catalogueId: string,
    productId: string,
    isActive: boolean
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.catalogueId === catalogueId && p.productId === productId
          ? { ...p, isActive }
          : p
      )
    );

    try {
      const response = await updateProductStatus(
        catalogueId,
        productId,
        isActive
      );
      enqueueSnackbar(response?.message || "Status updated", {
        variant: "success",
      });
    } catch (error) {
    const err = error as AxiosError<{ message?: string }>;

    // Revert optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p.catalogueId === catalogueId && p.productId === productId
          ? { ...p, isActive: !isActive }
          : p
      )
    );

    enqueueSnackbar(
      err.response?.data?.message || err.message || "Failed to update product status",
      {
        variant: "error",
      }
    );
  }
  };

  const handleEdit = (productId: string) => {
    navigate(`/catalogue/${id}/product/edit/${productId}`);
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteId(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
  if (!deleteId) return;
  try {
    await deleteProduct(deleteId);
    enqueueSnackbar("Product deleted successfully", { variant: "success" });

    // Fetch products again after deletion
    const res = await searchProductsApi(id!, debouncedSearch, page, PAGE_SIZE);

    if (res.products.length === 0 && page > 1) {
      // If no products on current page, go back one page
      const newPage = page - 1;
      setPage(newPage);
      const prevPageRes = await searchProductsApi(id!, debouncedSearch, newPage, PAGE_SIZE);
      setProducts(prevPageRes.products);
      setTotalPages(prevPageRes.totalPages || 1);
    } else {
      setProducts(res.products);
      setTotalPages(res.totalPages || 1);
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    enqueueSnackbar("Failed to delete product", { variant: "error" });
  } finally {
    handleCloseDeleteModal();
  }
};

  const handleCheckBox = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.productId));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleOpenUploadModal = () => setUploadModalOpen(true);

  const hasProducts = products.length > 0;

  return (
    <Box sx={{ px: 5, py: 0,maxHeight: "70vh", }}>
     

       <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <IconButton onClick={() => navigate(-1)}>
            <MdArrowBack size={24} />
          </IconButton>
          <Typography variant="h4" component="h1">
            {catName ? `${catName}` : "Catalogue"}
          </Typography>
        </Stack>


      <ActionBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
isCatalogueActive={isCatalogueActive}    
    menuItems={[
          { label: "Add Multiple Product", onClick: handleOpenUploadModal },
          { label: "Add Single Product", onClick: handleAddSingle },
        ]}
        createLabel="Add Product"
        searchPlaceholder="Search products..."
      />

      {loading ? (
        <ProductPageSkeleton />
      ) : !hasProducts ? (
        <Paper elevation={2}>
          <EmptyProductsCard title="No Products found" />
        </Paper>
      ) : (
        <>
          <Paper elevation={3}>
            <ProductTable
              products={products} //  already paginated by backend
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleOpenDeleteModal}
              onCheckBox={handleCheckBox}
              selectedProducts={selectedProducts}
              onSelectAll={handleSelectAll}
              isCatalogueActive={isCatalogueActive}
            />
          </Paper>

          {/* 👇 Pagination Controls */}
          <Stack spacing={2} alignItems="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => fetchProducts(debouncedSearch, value)}
              color="primary"
            />
          </Stack>
        </>
      )}

      <DeleteConfirmationDialog
        open={deleteModalOpen}
        deleteHeaderMessage={`Are you sure you want to delete ${catName}?`}
        message="You are about to Delete the Selected Product."
        alert="Are you Ready to proceed?"
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
      <ProductUploadDialog
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadProducts}
      />
    </Box>
  );
};

export default ProductPage;
