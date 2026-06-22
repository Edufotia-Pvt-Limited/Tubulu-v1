import { useState } from "react";
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
  CircularProgress
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { addNewCatalogueProduct } from "src/utils/ApiActions";
import { MdClose, MdArrowBack } from "react-icons/md";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { SvgIcon } from "@mui/material";


interface ProductForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  sku: string;
  category: string;
  subCategory: string;
  foodType: string;
  quantity: string;
  images: File[];
  discountPercentage: string;
  discountPrice: string;
  cgst: string;
  sgst: string;
  otherTaxes: string;
  speciality: string;
}
interface foodType {
  id: number;
  name: string;
  icon: JSX.Element;
}

const CreateProduct: React.FC = () => {
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
    discountPercentage: "",
    discountPrice: "",
    cgst: "",
    sgst: "",
    otherTaxes: "",
    speciality: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});

  const { catalogueId } = useParams<{ catalogueId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { catName, integrationCategory } = (location.state || {}) as { catName?: string, integrationCategory?:string };
  const [loading, setLoading] = useState(false);



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


  // Veg: Green square with white inner circle
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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Prevent negative numbers
    if (
      ["price", "discountPercentage", "discountPrice", "cgst", "sgst", "otherTaxes", "quantity"].includes(
        name
      )
    ) {
      if (value && parseFloat(value) < 0) return; // allow empty string
    }

    setForm((prev) => {
      let updatedForm: any = { ...prev, [name]: value };

      const price = parseFloat(name === "price" ? value : updatedForm.price) || 0;
      let discountPercentage = parseFloat(updatedForm.discountPercentage || "0");
      let discountPrice = parseFloat(updatedForm.discountPrice || "0");

      if (name === "discountPercentage" && parseFloat(value) > 100) {
        return prev; // ignore update
      }


      if (name === "discountPrice" && price > 0 && parseFloat(value) > price) {
        return prev; // ignore update
      }



      // Handle discountPercentage input
      if (name === "discountPercentage") {
        if (!value) {
          updatedForm.discountPrice = ""; // clear if empty
        } else if (/^\d*\.?\d{0,2}$/.test(value)) { // restrict to 2 decimals
          if (price > 0 && !isNaN(parseFloat(value))) {
            // Clamp percentage to max 100
            const discountPercentage = Math.min(parseFloat(value), 100);
            // Calculate discounted price
            updatedForm.discountPrice = (
              price - (price * discountPercentage) / 100
            ).toFixed(2);
          }
        } else {
          // Invalid input (more than 2 decimals) → ignore change
          return prev;
        }
      }

      // Handle discountPrice input
      if (name === "discountPrice") {
        if (!value) {
          updatedForm.discountPercentage = ""; // clear if empty
        } else if (/^\d*\.?\d{0,2}$/.test(value)) { // restrict to 2 decimals
          if (price > 0 && !isNaN(parseFloat(value))) {
            // Clamp price to max price
            const discountPrice = Math.min(parseFloat(value), price);
            // Calculate discount percentage
            updatedForm.discountPercentage = (
              ((price - discountPrice) / price) * 100
            ).toFixed(2);
          }
        } else {
          // Invalid input (more than 2 decimals) → ignore change
          return prev;
        }
      }


      // Handle price change
      if (name === "price") {
        if (!value || price <= 0) {
          updatedForm.discountPrice = "";
          updatedForm.discountPercentage = "";
        } else {
          if (discountPercentage > 0) {
            updatedForm.discountPrice = (price - (price * discountPercentage) / 100).toFixed(2);
          } else if (discountPrice > 0) {
            updatedForm.discountPercentage = (((price - discountPrice) / price) * 100).toFixed(2);
          }
        }
      }

      return updatedForm;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    // Only allow up to 4 images
    const allowedFiles = newFiles.slice(0, 4 - form.images.length);

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...allowedFiles],
    }));

    setErrors((prev) => ({
      ...prev,
      images: "",
    }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProductForm, string>> = {};

    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.currency.trim()) newErrors.currency = "Currency is required";
    if (!form.price.trim()) newErrors.price = "Price is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.quantity.trim()) newErrors.quantity = "Quantity is required";
    if (form.images.length === 0) newErrors.images = "At least one product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!validateForm()) {
      enqueueSnackbar("Please fill all required fields.", { variant: "error" });
      return;
    }

    try {
      setLoading(true);

      const reqBody = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "images") {
          (value as File[]).forEach((file) => reqBody.append("images", file));
        } else {
          reqBody.append(key, value as string);
        }
      });



      await addNewCatalogueProduct(reqBody, catalogueId);

      setForm({
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
        discountPercentage: "",
        discountPrice: "",
        cgst: "",
        sgst: "",
        otherTaxes: "",
        speciality: "",
      });
      setErrors({});

      enqueueSnackbar("Product created successfully!", { variant: "success" });
      navigate(-1);
    } catch (error: any) {
      const backendErrors = error?.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        backendErrors.forEach((err: { field: string; message: string }) => {
          enqueueSnackbar(`${err.field}: ${err.message}`, { variant: "error" });
        });
      } else {
        enqueueSnackbar(
          error?.response?.data?.message || "Failed to create product. Please try again.",
          { variant: "error" }
        );
      }
    } finally {
      setLoading(false);
    }
  };





  return (
    <Box sx={{ p: 1, maxHeight: "70vh", }}>
      <Paper sx={{ position: "relative" }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <IconButton onClick={() => navigate(-1)}>
            <MdArrowBack size={24} />
          </IconButton>
          <Typography variant="h4" component="h1">
            {catName ? `${catName}` : "Catalogue"}
          </Typography>
        </Stack>

        {/* Scrollable Form with 300px height */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            maxHeight: { xs: "auto", md: 430 },
            overflowY: "auto",
            p: { xs: 1, md: 3 },
          }}
        >
          <Grid container spacing={3}>
            {/* General Information */}
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
                      error={!!errors.name}
                      helperText={errors.name}
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

            {/* Upload Images */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {form.images.length === 0 ? (
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "text.secondary",
                      fontSize: "1rem",
                    }}
                  >
                    No images selected
                  </CardContent>
                ) : (
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                      {form.images.map((file, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                          <Box sx={{ position: "relative" }}>
                            <Box
                              component="img"
                              src={URL.createObjectURL(file)}
                              alt={`preview-${index}`}
                              sx={{
                                width: "100%",
                                height: 120,
                                objectFit: "contain",
                                borderRadius: 2,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveImage(index)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                backgroundColor: "rgba(255,255,255,0.7)",
                              }}
                            >
                              <MdClose size={18} color="red" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                )}

                <Box p={2} textAlign="center" borderTop="1px solid #eee">
                  <Tooltip
                    title={
                      form.images.length >= 4
                        ? "Maximum 4 images allowed"
                        : ""
                    }
                  >
                    <span>
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={form.images.length >= 4}
                      >
                        Upload Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                        />
                      </Button>
                    </span>
                  </Tooltip>
                  {errors.images && (
                    <Typography
                      color="error"
                      variant="caption"
                      display="block"
                      mt={1}
                    >
                      {errors.images}
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
                      error={!!errors.price}
                      helperText={errors.price}
                    />

                    <Grid container spacing={2}>
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
                        <TextField
                          select
                          label="Currency"
                          name="currency"
                          value={form.currency}
                          onChange={handleChange}
                          fullWidth
                          error={!!errors.currency}
                          helperText={errors.currency}
                        >
                          {currencies.map((currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                              {currency.label} ({currency.code})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="CGST"
                          name="cgst"
                          type="number"
                          value={form.cgst}
                          onChange={handleChange}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          label="SGST"
                          name="sgst"
                          type="number"
                          value={form.sgst}
                          onChange={handleChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Other Taxes"
                          name="otherTaxes"
                          type="number"
                          value={form.otherTaxes}
                          onChange={handleChange}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Inventory & Category */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2} sx={{ width: "100%" }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Inventory
                    </Typography>
                    <Box>
                      <TextField
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={form.quantity}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.quantity}
                        helperText={errors.quantity}
                      />
                    </Box>
                  </CardContent>
                </Card>
{
  integrationCategory === "Food and beverage" ? (
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

                        <TextField
                          label="Category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          fullWidth
                          error={!!errors.category}
                          helperText={errors.category}
                        />
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
          error={!!errors.category}
          helperText={errors.category}
        />
      </Box>
    </Stack>
  </CardContent>
</Card>

    </>

  )
}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Fixed Save Button */}
        <Box
          mt={3}
          textAlign="right"
          sx={{
            position: { xs: "static", sm: "static", md: "sticky" }, // sticky only on md+
            bottom: { md: 0 },
            backgroundColor: "white",
            pr: { xs: 0, sm: 2, md: 4 },
            py: 1,
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Save"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateProduct;

