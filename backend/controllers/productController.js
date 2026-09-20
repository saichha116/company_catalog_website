const db = require("../config/db");

// ===============================
// Add Product
// ===============================

const addProduct = (req, res) => {
    const {
        category_id,
        subcategory_id,
        product_name,
        description,
        stock
    } = req.body;

    const image = req.file
        ? req.file.filename
        : null;

    const sql = `
        INSERT INTO products
        (
            category_id,
            subcategory_id,
            product_name,
            description,
            stock,
            image
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            category_id,
            subcategory_id || null,
            product_name,
            description,
            stock,
            image
        ],
        (err, result) => {
            if (err) {
                console.log("Product insert error:", err);

                return res.status(500).json({
                    message: "Product insert failed"
                });
            }

            res.status(201).json({
                message: "Product added successfully",
                product_id: result.insertId
            });
        }
    );
};


// ===============================
// Get All Products
// ===============================

const getProducts = (req, res) => {
    const sql = `
        SELECT
            p.*,
            c.category_name,
            c.main_category_id,
            s.subcategory_name
        FROM products p
        JOIN categories c
            ON p.category_id = c.category_id
        LEFT JOIN subcategories s
            ON p.subcategory_id = s.subcategory_id
        ORDER BY p.product_id DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log("Fetch products error:", err);

            return res.status(500).json({
                message: "Failed to fetch products"
            });
        }

        res.json(result);
    });
};


// ===============================
// Get Single Product
// ===============================

const getProductById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            p.*,
            c.category_name,
            c.category_image,
            c.main_category_id,
            s.subcategory_name
        FROM products p
        JOIN categories c
            ON p.category_id = c.category_id
        LEFT JOIN subcategories s
            ON p.subcategory_id = s.subcategory_id
        WHERE p.product_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log("Fetch single product error:", err);

            return res.status(500).json({
                message: "Failed to fetch product"
            });
        }

        // Product does not exist
        if (result.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Send product
        res.json(result[0]);
    });
};


// ===============================
// Delete Product
// ===============================

const deleteProduct = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM products
        WHERE product_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log("Product delete error:", err);

            return res.status(500).json({
                message: "Product delete failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });
    });
};


// ===============================
// Update Product
// ===============================

const updateProduct = (req, res) => {
    const { id } = req.params;

    const {
        category_id,
        subcategory_id,
        product_name,
        description,
        stock
    } = req.body;

    const image = req.file
        ? req.file.filename
        : null;

    let sql;
    let values;


    // ===============================
    // UPDATE WITH NEW IMAGE
    // ===============================

    if (image) {
        sql = `
            UPDATE products
            SET
                category_id=?,
                subcategory_id=?,
                product_name=?,
                description=?,
                stock=?,
                image=?
            WHERE product_id=?
        `;

        values = [
            category_id,
            subcategory_id || null,
            product_name,
            description,
            stock,
            image,
            id
        ];
    }


    // ===============================
    // UPDATE WITHOUT NEW IMAGE
    // ===============================

    else {
        sql = `
            UPDATE products
            SET
                category_id=?,
                subcategory_id=?,
                product_name=?,
                description=?,
                stock=?
            WHERE product_id=?
        `;

        values = [
            category_id,
            subcategory_id || null,
            product_name,
            description,
            stock,
            id
        ];
    }


    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("Product update error:", err);

            return res.status(500).json({
                message: "Product update failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully"
        });
    });
};


// ===============================
// EXPORT
// ===============================

module.exports = {
    addProduct,
    getProducts,
    deleteProduct,
    getProductById,
    updateProduct
};