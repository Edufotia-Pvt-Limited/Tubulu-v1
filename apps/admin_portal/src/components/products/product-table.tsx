import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Button,
  Paper,
  Checkbox,
} from "@mui/material";
import { PiTrash } from "react-icons/pi";
import Label from "src/components/label";

export type ProductType = {
  productId: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  productCurrency: string;
  productImages: string[];
  catalogueName: string;
  catalogueId: string;
  catalogueDescription: string;
  foodType: string,
  quantity: number,
  isActive: boolean,
  category: string
  subCategory: string,
  speciality?: string;
};
interface ProductTableProps {
  products: ProductType[];
  onToggle: (catalogueId: string, productId: string, isActive: boolean) => void;
  onEdit: (productId: string) => void;
  onDelete: (id: string) => void;
  onCheckBox: (id: string) => void;
  selectedProducts: string[];
  onSelectAll: (checked: boolean) => void;
  isCatalogueActive: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onToggle,
  onEdit,
  onDelete,
  onCheckBox,
  selectedProducts,
  onSelectAll,
  isCatalogueActive
}) => {

  console.log("iscatatlogueActive", isCatalogueActive)
  return (
    <TableContainer component={Paper}
      sx={{
        maxHeight: 430,
        overflowY: "auto",

      }}
    >
      <Table stickyHeader sx={{ minWidth: 650 }}>
        <TableHead >
          <TableRow >
            <TableCell align="center">
              <Checkbox
                checked={
                  products.length > 0 && selectedProducts.length === products.length
                }
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </TableCell>
            <TableCell align="center" >Product Image</TableCell>
            <TableCell align="center">Product Name</TableCell>
            <TableCell align="center">Description</TableCell>
            <TableCell align="center">Price</TableCell>
            <TableCell align="center">Quantity</TableCell>
            <TableCell align="center">Category</TableCell>
            <TableCell align="center">Subcategory</TableCell>
            <TableCell align="center">Speciality</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((product) => (

            <TableRow key={product.productId}>
              {/* Active Switch */}
              <TableCell align="center">
                <Checkbox
                  checked={selectedProducts.includes(product.productId)}
                  onChange={() => onCheckBox(product.productId)}

                />
              </TableCell>

              {/* Product Image */}
              <TableCell align="center">
                <img
                  src={product.productImages?.[0]}
                  alt={product.productName}
                  style={{ width: 70, height: 60, borderRadius: 8 }}
                />
              </TableCell>

              {/* Name & Description */}
              <TableCell align="center">{product.productName}</TableCell>
              <TableCell >{product.productDescription}</TableCell>
              {/* Price */}
              <TableCell align="center">{product.productPrice}</TableCell>
              {/* Quantity */}
              <TableCell align="center">{product.quantity}</TableCell>

              {/* Currency */}
              <TableCell align="center">{product.category}</TableCell>


              {/* Subcategory */}
              <TableCell align="center">{product.subCategory}</TableCell>
            
              {/* Speciality */}
              <TableCell align="center">
                <Label color={product.speciality ? 'info' : 'default'}>
                  {product.speciality || 'None'}
                </Label>
              </TableCell>

              {/* Actions */}
              <TableCell align="center">
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    cursor: "pointer",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Switch
                    checked={product.isActive ?? true}
                    onChange={(e) => onToggle(product.catalogueId, product.productId, e.target.checked)}
                    color="primary"
                    size="small"

                  />
                  {/* Edit Icon */}
                  <span
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => onEdit(product.productId)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M18 2L15.6 4.4 19.6 8.4 22 6zM14.1 5.9L3 17v4h4l11.1-11.1z"
                        fill="#637381"
                      />
                    </svg>
                  </span>

                  {/* Delete Button */}

                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => onDelete(product.productId)}
                    style={{ minWidth: 28, padding: "2px 6px" }}
                  >
                    <PiTrash size={16} fill="#FF5630" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductTable;

