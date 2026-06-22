const { getAllIntegrations } = require("../Services/Integration.Service");
const ErrorBody = require("../Utils/ErrorBody");
const Strings = require("../Utils/Strings");

function getCategories(req, res, next) {
  res.send({
    success: true,
    data: [
      {
        _id: 1,
        name: 'AI & ML',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/ai&ml.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }, {
          _id: 2,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }, {
          _id: 3,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
      {
        _id: 2,
        name: 'Automotive',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/Automotive.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
      {
        _id: 3,
        name: 'Education',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/education.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
      {
        _id: 4,
        name: 'Banking',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/bank.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
      {
        _id: 5,
        name: 'Finance',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/finance_logo.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
      {
        _id: 6,
        name: 'Travel',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/Travel.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
      {
        _id: 7,
        name: 'Fashion',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/fashion_logo.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
       {
        _id: 8,
        name: 'Food and beverage',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/Travel.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
       {
        _id: 9,
        name: 'Grocery',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/fashion_logo.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
       {
        _id: 10,
        name: 'Govt Sector',
        logo: 'https://tubuludata.s3.amazonaws.com/explore_screen/category/bank.png',
        advertisements: [{
          _id: 1,
          logo: 'https://tubuludata.s3.amazonaws.com/category_ad.png'
        }]
      },
    ]
  })
}

async function getIntegrationByCategory(req, res, next) {
  try {
    const { params: { category } } = req;
    const integrationList = await getAllIntegrations({
      page: 0,
      size: 5,
      category
    })
    res.send({
      success: true,
      data: integrationList
    })
  } catch (error) {
    next(new ErrorBody(error.statusCode || 500, error.message || Strings.SERVER_ERROR, error.errors || []))
  }
}


function getCategoriesForIntegrationsFilter(req, res, next) {
  try {
    const categories = [
      "All",
      "Active Cart",
      "Food and beverage",
      "Grocery",
      "AI & ML",
      "Automotive",
      "Education",
      "Banking",
      "Finance",
      "Travel",
      "Fashion",
      "Govt Sector"
    ];

   
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}






module.exports = {
  getCategories,
  getIntegrationByCategory,
  getCategoriesForIntegrationsFilter
}