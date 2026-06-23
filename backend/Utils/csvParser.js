
const csv = require("csv-parser");
const { Readable } = require("stream");

const REQUIRED_FIELDS = [
  "name",
  "price",
  "currency",
  "quantity",
  "product_category"
];




const catalogueCSVParse = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const validProducts = [];
    let rowIndex = 0;

    const stream = Readable.from(fileBuffer);

    stream
      .pipe(csv({
        mapHeaders: ({ header }) => {
          const cleaned = header.toLowerCase().replace(/[\s_-]+/g, '');
          const headerMap = {
            name: 'name',
            description: 'description',
            price: 'price',
            currency: 'currency',
            sku: 'sku',
            imageurls: 'imageUrls',
            foodtype: 'foodType',
            productcategory: 'product_category',
            productsubcategory: 'product_subcategory',
            quantity: 'quantity',
            discountpercentage: 'discountPercentage',
            discountprice: 'discountPrice',
            cgst: 'cgst',
            sgst: 'sgst',
            othertaxes: 'otherTaxes',
            speciality: 'speciality',
            futureref1: 'future_ref1',
            futureref2: 'future_ref2',
            preference: 'preference'
          };
          return headerMap[cleaned] || cleaned;
        }
      }))
      .on("data", (row) => {
        rowIndex++;
        const errors = [];

        // Validate required fields
        for (const field of REQUIRED_FIELDS) {
          if (!row[field] || row[field].trim() === "") {
            errors.push(`${field} is required`);
          }
        }

        if (errors.length > 0) {
          // Immediately stop execution
          stream.destroy();
          return reject(
            new Error(`Row ${rowIndex} invalid: ${errors.join(", ")}`)
          );
        }

        // Parse numeric fields safely
        const price = parseFloat(row.price) || 0;
        let discountPercentage = parseFloat(row.discountPercentage);
        let discountPrice = parseFloat(row.discountPrice);

        //  Handle discount logic
        if (!discountPercentage || isNaN(discountPercentage) || discountPercentage === 0) {
          discountPercentage = 0;
          discountPrice = price;
        } else if (!discountPrice || isNaN(discountPrice) || discountPrice === 0) {
          discountPrice = price - (price * discountPercentage) / 100;
          discountPrice = Math.floor(discountPrice * 100) / 100; // round to 2 decimals
        }

        const foodType = row.foodType && row.foodType.trim() !== ""
          ? row.foodType.trim() 
          : "Other";

        // Parse valid product
        validProducts.push({
          name: row.name?.trim(),
          description: row.description?.trim() || "",
          price,
          currency: row.currency?.trim() || "INR",
          sku: row.sku?.trim(),
          imageUrls: row.imageUrls
            ? row.imageUrls.split(",").map((u) => u.trim())
            : [],
            foodType,
          product_category: row.product_category?.trim() || "",
          product_subcategory: row.product_subcategory?.trim() || "",
          quantity: parseInt(row.quantity, 10) || 0,
          discountPercentage,
          discountPrice,
          cgst: parseFloat(row.cgst) || 0,
          sgst: parseFloat(row.sgst) || 0,
          otherTaxes: parseFloat(row.otherTaxes) || 0,
          speciality: row.speciality?.trim() || "",
          future_ref1: row.future_ref1?.trim() || "",
          future_ref2: row.future_ref2?.trim() || "",
          preference: row.preference?.trim() || "",
        });
      })
      .on("end", () => resolve(validProducts))
      .on("error", (err) => reject(err));
  });
};



module.exports = { catalogueCSVParse };
