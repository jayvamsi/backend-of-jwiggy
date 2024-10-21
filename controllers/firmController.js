const Firm = require("../models/Firm");
const Vendor = require("../models/Vendor");
const multer = require("multer");
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Using the absolute path for the uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const addFirm = async (req, res) => {
  try {
    const { firmName, area, category, region, offer } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    if(vendor.firm.length > 0){
      return res.status(400).json({message:"vendor can have only one firm"});
    }

    const firm = new Firm({
      firmName,
      area,
      category,
      region,
      offer,
      image,
      vendor: vendor._id,
    });
    const savedFirm = await firm.save();

    const firmId=savedFirm._id

    // vendor.firm.push(savedFirm);
    const vendorFirmName = savedFirm.firmName

    await vendor.save();

    return res.status(200).json({ message: "Firm added successfully" ,firmId});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteFirmById = async (req, res) => {
  try {
    const firmId = req.params.firmId;
    const deletedProduct = await Firm.findByIdAndDelete(firmId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "No product found" });
    }

    return res.status(200).json({ message: "Firm deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addFirm: [upload.single("image"), addFirm],
  deleteFirmById,
};
