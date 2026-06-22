import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { MdClose, MdArrowBack } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import { editCatalogueProduct, fetchProductDetails } from "src/utils/ApiActions";

import EditProductSkeleton from "src/components/products/edit-product-skeleton";
import { AxiosError } from "axios";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  sku: string;
  category: string;
  subCategory: string;
  foodType: "Veg" | "Non Veg" | "Egg" | ""
  quantity: string;
  images: File[];
  existingImages: string[];
  discountPercentage: string;
  discountPrice: string;
  cgst: string;
  sgst: string;
  otherTaxes: string;
  integrationCategory:string;
  speciality: string;
}

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { catalogueId, productId } = useParams<{ catalogueId: string; productId: string }>();

  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    currency: "",
    sku: "",
    category: "",
    subCategory: "",
    foodType: "",
    quantity: "",
    images: [],
    existingImages: [],
    discountPercentage: "",
    discountPrice: "",
    cgst: "",
    sgst: "",
    otherTaxes: "",
    integrationCategory:"",
    speciality: "" 
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [catalogueName, setCatalogueName] = useState<string>("");
  const currencies = [
    { code: "USD", label: "US Dollar" },
    { code: "EUR", label: "Euro" },
    { code: "GBP", label: "British Pound" },
    { code: "JPY", label: "Japanese Yen" },
    { code: "AUD", label: "Australian Dollar" },
    { code: "CAD", label: "Canadian Dollar" },
    { code: "CHF", label: "Swiss Franc" },
    { code: "CNY", label: "Chinese Yuan" },
    { code: "INR", label: "Indian Rupee" },
    { code: "SGD", label: "Singapore Dollar" },
  ];


  const VegIcon = () => (
    <Box
      sx={{
        width: 24,
        height: 24,
        backgroundColor: "#4CAF50", // green square
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1, // slightly rounded corners
        "&::after": {
          content: '""',
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#fff", // white inner circle
        },
      }}
    />
  );

  // Non-Veg: Red square with white hollow circle
  const NonVegIcon = () => (
    <Box
      sx={{
        width: 24,
        height: 24,
        backgroundColor: "#F44336", // red square
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        "&::after": {
          content: '""',
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#fff",
        },
      }}
    />
  );

  // Egg: Yellow square with slightly oval inner circle
  const EggIcon = () => (
    <Box
      sx={{
        width: 24,
        height: 24,
        backgroundColor: "#FFC107", // yellow square
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        "&::after": {
          content: '""',
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#fff",
        },
      }}
    />
  );

  // Assuming Preference type is defined elsewhere
  const preferences = [
    { value: "Veg", name: "Veg", icon: <VegIcon /> },
    { value: "Non Veg", name: "Non Veg", icon: <NonVegIcon /> },
    { value: "Egg", name: "Egg", icon: <EggIcon /> },
  ];

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId || !catalogueId) return;
      try {
        setLoading(true);
        const response = await fetchProductDetails(productId, catalogueId);
        if (response?.data) {
          const product = response.data;
          setCatalogueName(product.catalogueName);
          setForm({
            name: product.productName || "",
            description: product.productDescription || "",
            price: String(product.productPrice ?? ""),
            currency: product.productCurrency || "",
            sku: product.productSku || "",
            category: product.category || "",
            subCategory: product.subCategory || "",
            foodType: ["Veg", "Non Veg", "Egg"].includes(product.foodType)
              ? product.foodType
              : "",
            quantity: String(product.quantity ?? ""),
            images: [],
            existingImages: product.productImages || [],
            discountPercentage: String(product.discountPercentage ?? ""),
            discountPrice: String(product.discountPrice ?? ""),
            cgst: String(product.cgst ?? ""),
            sgst: String(product.sgst ?? ""),
            otherTaxes: String(product.otherTaxes ?? ""),
            integrationCategory: product.integrationCategory || "",
            speciality: product.speciality || "",
          });
        }
      } catch (err) {
        enqueueSnackbar("Failed to fetch product details", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId, catalogueId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Prevent negative numbers
    if (
      [
        "price",
        "discountPercentage",
        "discountPrice",
        "cgst",
        "sgst",
        "otherTaxes",
        "quantity",
      ].includes(name)
    ) {
      if (value && parseFloat(value) < 0) return; // allow empty string
    }

    setForm((prev) => {
      const updated: ProductForm = { ...prev, [name]: value };

      const price = parseFloat(
        name === "price" ? value : updated.price
      ) || 0;

      //  Prevent % > 100
      if (name === "discountPercentage") {
        if (parseFloat(value) > 100) return prev; // ignore update
      }

      //  Prevent discount price > price
      if (name === "discountPrice") {
        if (price > 0 && parseFloat(value) > price) return prev; // ignore update
      }



      if (name === "discountPercentage") {
        if (/^\d*\.?\d{0,2}$/.test(value))
          if (price > 0 && value !== "" && !isNaN(parseFloat(value))) {
            const pct = Math.min(Math.max(parseFloat(value), 0), 100);
            const discounted = price - (price * pct) / 100;
            updated.discountPrice = discounted.toFixed(2); // final price
          } else {
            updated.discountPrice = "";
          } else {
          // ✅ return previous state safely (don’t crash React)
          return prev;
        }
      }


      if (name === "discountPrice") {
        // allow only up to 2 decimal places
        if (/^\d*\.?\d{0,2}$/.test(value)) {
          if (price > 0 && value !== "" && !isNaN(parseFloat(value))) {
            let finalPrice = Math.min(Math.max(parseFloat(value), 0), price);
            const pct = ((price - finalPrice) / price) * 100;
            updated.discountPercentage = pct.toFixed(2);
          } else {
            updated.discountPercentage = "";
          }
        } else {
          // ✅ return previous state safely (don’t crash React)
          return prev;
        }
      }


      //  User changed price → recalc whichever discount is filled
      if (name === "price") {
        if (price <= 0) {
          updated.discountPrice = "";
          updated.discountPercentage = "";
        } else {
          if (updated.discountPercentage && !isNaN(parseFloat(updated.discountPercentage))) {
            const pct = Math.min(Math.max(parseFloat(updated.discountPercentage), 0), 100);
            updated.discountPrice = (price - (price * pct) / 100).toFixed(2);
          } else if (updated.discountPrice && !isNaN(parseFloat(updated.discountPrice))) {
            let finalPrice = Math.min(Math.max(parseFloat(updated.discountPrice), 0), price);
            updated.discountPercentage = (((price - finalPrice) / price) * 100).toFixed(2);
          }
        }
      }

      return updated;
    });

    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };





  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const allowedFiles = newFiles.slice(0, 4 - (form.images.length + form.existingImages.length));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...allowedFiles] }));
    setFormErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleRemoveImage = (index: number, type: "new" | "existing") => {
    if (type === "new") {
      setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    } else {
      setForm((prev) => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== index) }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Product name is required";
    if (!form.price.trim()) errors.price = "Price is required";
    if (!form.currency.trim()) errors.currency = "Currency is required";
    if (!form.quantity.trim()) errors.quantity = "Quantity is required";
    if (!form.category.trim()) errors.category = "Category is required";
    if (form.images.length + form.existingImages.length === 0) errors.images = "At least one product image is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const reqBody = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((file) => reqBody.append("images", file));
        } else if (key === "existingImages") {
          reqBody.append(key, JSON.stringify(value));
        } else {
          reqBody.append(key, value as string);
        }
      });

      await editCatalogueProduct(reqBody, productId!, catalogueId!);
      enqueueSnackbar("Product updated successfully!", { variant: "success" });
      navigate(-1);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const message =
        err.response?.data?.message || err.message || "Failed to update product";

      enqueueSnackbar(message, { variant: "error" });
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxHeight: { xs: "auto", md: "70vh" } }}>
      <Paper sx={{ position: "relative" }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={1} flexWrap="wrap" >
          <IconButton onClick={() => navigate(-1)}>
            <MdArrowBack size={24} />
          </IconButton>
          <Typography variant="h4" component="h1" >
            {catalogueName}
          </Typography>
        </Stack>

        {/* Scrollable Form */}
        {loading ? (
          <EditProductSkeleton />
        ) : (
          <Box
            component="form"
            id="productForm"
            onSubmit={handleSubmit}
            sx={{
              maxHeight: { xs: "auto", md: 430 },
              overflowY: "auto",
              p: { xs: 1, md: 3 },
            }}
          >
            <Grid container spacing={2}>
              {/* General Info */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      General Information
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Product Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                      />
                      <TextField
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                      />
                       <TextField
                        label="Product Speciality"
                        name="speciality"
                        value={form.speciality}
                        onChange={handleChange}
                        placeholder="e.g. Chef Special, Best Seller"
                        fullWidth
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Images */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {form.images.length + form.existingImages.length === 0 ? (
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "text.secondary",
                      }}
                    >
                      No images selected
                    </CardContent>
                  ) : (
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Grid container spacing={1}>
                        {form.existingImages.map((url, idx) => (
                          <Grid item xs={6} sm={3} key={`existing-${idx}`}>
                            <Box sx={{ position: "relative" }}>
                              <Box
                                component="img"
                                src={url}
                                alt={`existing-${idx}`}
                                sx={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 2 }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveImage(idx, "existing")}
                                sx={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(255,255,255,0.7)" }}
                              >
                                <MdClose size={18} color="red" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                        {form.images.map((file, idx) => (
                          <Grid item xs={6} sm={3} key={`new-${idx}`}>
                            <Box sx={{ position: "relative" }}>
                              <Box
                                component="img"
                                src={URL.createObjectURL(file)}
                                alt={`new-${idx}`}
                                sx={{ width: "100%", height: 120, objectFit: "contain", borderRadius: 2 }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveImage(idx, "new")}
                                sx={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(255,255,255,0.7)" }}
                              >
                                <MdClose size={18} color="red" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  )}
                  <Box p={1} textAlign="center" borderTop="1px solid #eee" sx={{ color: formErrors.images ? "red" : "inherit" }}>
                    <Tooltip title={form.images.length + form.existingImages.length >= 4 ? "Maximum 4 images allowed" : ""}>
                      <span>
                        <Button variant="outlined" component="label" disabled={form.images.length + form.existingImages.length >= 4} size="small">
                          Upload Image
                          <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
                        </Button>
                      </span>
                    </Tooltip>
                    {formErrors.images && (
                      <Typography variant="caption" color="error" display="block">
                        {formErrors.images}
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Grid>

              {/* Pricing */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pricing
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Price"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        fullWidth
                        error={!!formErrors.price}
                        helperText={formErrors.price}
                      />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            label="Discount %"
                            name="discountPercentage"
                            type="number"
                            value={form.discountPercentage}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Discounted Price"
                            name="discountPrice"
                            type="number"
                            value={form.discountPrice}
                            onChange={handleChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField select label="Currency" name="currency" value={form.currency} onChange={handleChange} fullWidth error={!!formErrors.currency} helperText={formErrors.currency}>
                            {currencies.map((c) => (
                              <MenuItem key={c.code} value={c.code}>
                                {c.label} ({c.code})
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="CGST" name="cgst" type="number" value={form.cgst} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="SGST" name="sgst" type="number" value={form.sgst} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Other Taxes" name="otherTaxes" type="number" value={form.otherTaxes} onChange={handleChange} fullWidth />
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Inventory & Category */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Inventory
                      </Typography>
                      <Box>
                        <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} fullWidth error={!!formErrors.quantity} helperText={formErrors.quantity} />
                      </Box>
                    </CardContent>
                  </Card>
{ 
form.integrationCategory === "Food and beverage" ? (
<>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Category
                      </Typography>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>

                          <TextField
                            select
                            label="Food Preference"
                            name="foodType"
                            value={form.foodType}
                            onChange={handleChange}
                            fullWidth

                          >
                            <MenuItem value="" disabled>
                              Select Food Preference
                            </MenuItem>
                            {preferences.map((pref) => (
                              <MenuItem key={pref.value} value={pref.value}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {pref.icon}
                                  {pref.value}
                                </Box>
                              </MenuItem>
                            ))}
                          </TextField>



                          <TextField label="Category" name="category" value={form.category} onChange={handleChange} fullWidth error={!!formErrors.category} helperText={formErrors.category} />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                  </>
):(
<>

                  <Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Category
    </Typography>
    <Stack spacing={2}>
      <Box>
        <TextField
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.category}
          helperText={formErrors.category}
        />
      </Box>
    </Stack>
  </CardContent>
</Card>
</>)}


                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
        {/* Sticky Save Button */}
        <Box mt={3} textAlign="right" sx={{
          position: { xs: "static", sm: "static", md: "sticky" }, // sticky only on md+
          bottom: { md: 0 },
          backgroundColor: "white",
          pr: { xs: 0, sm: 2, md: 4 },
          py: 1,
        }}>
          <Button type="submit" variant="contained" color="primary" form="productForm" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditProduct;
