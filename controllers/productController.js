const Product = require("../models/Product");
const multer = require("multer");
const Firm = require("../models/Firm");
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');},
  filename:function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const addProduct = async (req, res) => {
  const firmId = req.params.firmId;
  try {
    const { productName, price, category, bestSeller, description } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const firm = await Firm.findById(firmId);

    if (!firm) {
      return res.status(404).json({ error: "no firm found" });
    }

    const product = new Product({
      productName,
      price,
      category,
      bestSeller,
      description,
      image,
      firm: firm._id,
    });

    const savedProduct = await product.save();
    firm.products.push(savedProduct);
    await firm.save();

    res.status(200).json({ savedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
};

const getProductByFirm = async (req, res) => {
  try {
    const firmId = req.params.firmId;
    const firm = await Firm.findById(firmId);
    if (!firm) {
      return res.status(404).json({ error: "no firm found" });
    }

    const restaurentName = firm.firmName;
    const products = await Product.find({ firm: firmId });
    res.status(200).json({ restaurentName, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "No product found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports = {
  addProduct: [upload.single('image'), addProduct],
  getProductByFirm,
  deleteProductById
};
