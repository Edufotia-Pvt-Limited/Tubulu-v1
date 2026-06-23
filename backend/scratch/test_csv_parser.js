const { catalogueCSVParse } = require('../Utils/csvParser');

async function test() {
    // CSV with exact headers matching SAMPLE_HEADERS
    const csvContent = `Name,Description,Price,Currency,SKU,ImageUrls,Product_Category,Quantity,CGST,SGST,OtherTaxes,Speciality,Future_Ref1,Future_Ref2
Product 1,Desc 1,100,INR,SKU1,url1,Cat 1,10,5,5,2,Spec 1,Ref1,Ref2`;
    const buffer = Buffer.from(csvContent);
    try {
        const result = await catalogueCSVParse(buffer);
        console.log('Result:', result);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
test();
