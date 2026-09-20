const express = require("express");
const router = express.Router();

const multer = require("multer");

const {
    addService,
    getServices,
    deleteService,
    getServiceById,
    updateService
} = require("../controllers/serviceController");


// ===============================
// Image Upload
// ===============================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() + "-" + file.originalname
        );

    }

});

const upload = multer({
    storage: storage
});


// ===============================
// Routes
// ===============================

router.get("/", getServices);

router.get("/:id", getServiceById);

router.post(
    "/",
    upload.single("image"),
    addService
);

router.put(
    "/:id",
    upload.single("image"),
    updateService
);

router.delete(
    "/:id",
    deleteService
);


module.exports = router;