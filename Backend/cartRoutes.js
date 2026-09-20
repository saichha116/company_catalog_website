const express = require("express");

const router = express.Router();

const db = require("./config/db");

// ======================================
// ADD PRODUCT OR SERVICE TO CART
// POST /api/cart
// ======================================

router.post("/", (req, res) => {
  const {
    user_id,
    product_id,
    service_id,
    quantity,
  } = req.body;

  console.log("ADD TO CART REQUEST:", req.body);

  if (!user_id) {
    return res.status(400).json({
      message: "user_id is required",
    });
  }

  if (!product_id && !service_id) {
    return res.status(400).json({
      message:
        "Either product_id or service_id is required",
    });
  }

  if (product_id && service_id) {
    return res.status(400).json({
      message:
        "Send either product_id or service_id, not both",
    });
  }

  const qty = Number(quantity) || 1;

  if (qty < 1) {
    return res.status(400).json({
      message: "Quantity must be at least 1",
    });
  }

  // ======================================
  // PRODUCT
  // ======================================

  if (product_id) {
    const productQuery = `
      SELECT *
      FROM products
      WHERE product_id = ?
    `;

    db.query(
      productQuery,
      [product_id],
      (err, productResults) => {
        if (err) {
          console.error(
            "PRODUCT QUERY ERROR:",
            err
          );

          return res.status(500).json({
            message: "Database error",
            error: err.message,
            sqlMessage: err.sqlMessage,
          });
        }

        console.log(
          "PRODUCT RESULT:",
          productResults
        );

        if (productResults.length === 0) {
          return res.status(404).json({
            message: "Product not found",
          });
        }

        const product = productResults[0];

        if (Number(product.stock) <= 0) {
          return res.status(400).json({
            message: "Product is out of stock",
          });
        }

        if (qty > Number(product.stock)) {
          return res.status(400).json({
            message: `Only ${product.stock} item(s) available in stock`,
          });
        }

        // CHECK EXISTING PRODUCT IN CART
        const cartQuery = `
          SELECT *
          FROM cart_items
          WHERE user_id = ?
          AND product_id = ?
        `;

        db.query(
          cartQuery,
          [user_id, product_id],
          (err, cartResults) => {
            if (err) {
              console.error(
                "CART QUERY ERROR:",
                err
              );

              return res.status(500).json({
                message: "Database error",
                error: err.message,
                sqlMessage: err.sqlMessage,
              });
            }

            console.log(
              "PRODUCT CART RESULT:",
              cartResults
            );

            // PRODUCT ALREADY IN CART
            if (cartResults.length > 0) {
              const currentQuantity =
                Number(cartResults[0].quantity);

              const newQuantity =
                currentQuantity + qty;

              if (
                newQuantity >
                Number(product.stock)
              ) {
                return res.status(400).json({
                  message: `Only ${product.stock} item(s) available in stock`,
                });
              }

              const updateQuery = `
                UPDATE cart_items
                SET quantity = ?
                WHERE user_id = ?
                AND product_id = ?
              `;

              db.query(
                updateQuery,
                [
                  newQuantity,
                  user_id,
                  product_id,
                ],
                (err, result) => {
                  if (err) {
                    console.error(
                      "CART UPDATE ERROR:",
                      err
                    );

                    return res.status(500).json({
                      message:
                        "Unable to update cart",
                      error: err.message,
                      sqlMessage:
                        err.sqlMessage,
                    });
                  }

                  console.log(
                    "PRODUCT CART UPDATED:",
                    result
                  );

                  return res.json({
                    success: true,
                    type: "product",
                    message:
                      "Product quantity updated",
                    quantity: newQuantity,
                  });
                }
              );

              return;
            }

            // ADD NEW PRODUCT
            const insertQuery = `
              INSERT INTO cart_items
              (
                user_id,
                product_id,
                service_id,
                quantity
              )
              VALUES (?, ?, NULL, ?)
            `;

            db.query(
              insertQuery,
              [
                user_id,
                product_id,
                qty,
              ],
              (err, result) => {
                if (err) {
                  console.error(
                    "PRODUCT CART INSERT ERROR:",
                    err
                  );

                  return res.status(500).json({
                    message:
                      "Unable to add product",
                    error: err.message,
                    sqlMessage:
                      err.sqlMessage,
                  });
                }

                console.log(
                  "PRODUCT CART INSERTED:",
                  result
                );

                return res.status(201).json({
                  success: true,
                  type: "product",
                  message:
                    "Product added to cart",
                  cart_item_id:
                    result.insertId,
                  quantity: qty,
                });
              }
            );
          }
        );
      }
    );

    return;
  }

  // ======================================
  // SERVICE
  // ======================================

  if (service_id) {
    const serviceQuery = `
      SELECT *
      FROM services
      WHERE service_id = ?
    `;

    db.query(
      serviceQuery,
      [service_id],
      (err, serviceResults) => {
        if (err) {
          console.error(
            "SERVICE QUERY ERROR:",
            err
          );

          return res.status(500).json({
            message: "Database error",
            error: err.message,
            sqlMessage: err.sqlMessage,
          });
        }

        console.log(
          "SERVICE RESULT:",
          serviceResults
        );

        if (serviceResults.length === 0) {
          return res.status(404).json({
            message: "Service not found",
          });
        }

        // CHECK EXISTING SERVICE IN CART
        const cartQuery = `
          SELECT *
          FROM cart_items
          WHERE user_id = ?
          AND service_id = ?
        `;

        db.query(
          cartQuery,
          [user_id, service_id],
          (err, cartResults) => {
            if (err) {
              console.error(
                "SERVICE CART QUERY ERROR:",
                err
              );

              return res.status(500).json({
                message: "Database error",
                error: err.message,
                sqlMessage: err.sqlMessage,
              });
            }

            console.log(
              "SERVICE CART RESULT:",
              cartResults
            );

            // SERVICE ALREADY IN CART
            if (cartResults.length > 0) {
              const currentQuantity =
                Number(
                  cartResults[0].quantity
                );

              const newQuantity =
                currentQuantity + qty;

              const updateQuery = `
                UPDATE cart_items
                SET quantity = ?
                WHERE user_id = ?
                AND service_id = ?
              `;

              db.query(
                updateQuery,
                [
                  newQuantity,
                  user_id,
                  service_id,
                ],
                (err, result) => {
                  if (err) {
                    console.error(
                      "SERVICE CART UPDATE ERROR:",
                      err
                    );

                    return res.status(500).json({
                      message:
                        "Unable to update service cart",
                      error: err.message,
                      sqlMessage:
                        err.sqlMessage,
                    });
                  }

                  console.log(
                    "SERVICE CART UPDATED:",
                    result
                  );

                  return res.json({
                    success: true,
                    type: "service",
                    message:
                      "Service quantity updated",
                    quantity: newQuantity,
                  });
                }
              );

              return;
            }

            // ADD NEW SERVICE
            const insertQuery = `
              INSERT INTO cart_items
              (
                user_id,
                product_id,
                service_id,
                quantity
              )
              VALUES (?,
                      NULL,
                      ?,
                      ?)
            `;

            db.query(
              insertQuery,
              [
                user_id,
                service_id,
                qty,
              ],
              (err, result) => {
                if (err) {
                  console.error(
                    "SERVICE CART INSERT ERROR:",
                    err
                  );

                  return res.status(500).json({
                    message:
                      "Unable to add service",
                    error: err.message,
                    sqlMessage:
                      err.sqlMessage,
                  });
                }

                console.log(
                  "SERVICE CART INSERTED:",
                  result
                );

                return res.status(201).json({
                  success: true,
                  type: "service",
                  message:
                    "Service added to cart",
                  cart_item_id:
                    result.insertId,
                  quantity: qty,
                });
              }
            );
          }
        );
      }
    );

    return;
  }
});

// ======================================
// GET CART
// GET /api/cart/:user_id
// ======================================

router.get(
  "/:user_id",
  (req, res) => {
    const user_id = req.params.user_id;

    const query = `
      SELECT

        cart_items.cart_item_id,
        cart_items.user_id,
        cart_items.product_id,
        cart_items.service_id,
        cart_items.quantity,

        /* PRODUCT DETAILS */

        products.product_name,
        products.description AS product_description,
        products.min_price AS product_min_price,
        products.max_price AS product_max_price,
        products.image AS product_image,
        products.stock AS product_stock,

        /* PRODUCT CATEGORY */

        product_categories.category_name AS product_category_name,

        subcategories.subcategory_name,

        /* SERVICE DETAILS */

        services.service_name,
        services.description AS service_description,
        services.min_price AS service_min_price,
        services.max_price AS service_max_price,
        services.image AS service_image,
        services.category AS service_category

      FROM cart_items

      LEFT JOIN products
        ON cart_items.product_id =
           products.product_id

      LEFT JOIN categories AS product_categories
        ON products.category_id =
           product_categories.category_id

      LEFT JOIN subcategories
        ON products.subcategory_id =
           subcategories.subcategory_id

      LEFT JOIN services
        ON cart_items.service_id =
           services.service_id

      WHERE cart_items.user_id = ?

      ORDER BY cart_items.cart_item_id DESC
    `;

    db.query(
      query,
      [user_id],
      (err, results) => {
        if (err) {
          console.error(
            "GET CART ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Unable to fetch cart",
            error: err.message,
            sqlMessage: err.sqlMessage,
          });
        }

        // Convert the database result
        // into a simple common cart format

        const cart = results.map(
          (item) => {
            if (item.product_id) {
              return {
                cart_item_id:
                  item.cart_item_id,

                user_id:
                  item.user_id,

                product_id:
                  item.product_id,

                service_id: null,

                quantity:
                  item.quantity,

                type: "product",

                name:
                  item.product_name,

                product_name:
                  item.product_name,

                description:
                  item.product_description,

                min_price:
                  item.product_min_price,

                max_price:
                  item.product_max_price,

                image:
                  item.product_image,

                stock:
                  item.product_stock,

                category_name:
                  item.product_category_name,

                subcategory_name:
                  item.subcategory_name,
              };
            }

            return {
              cart_item_id:
                item.cart_item_id,

              user_id:
                item.user_id,

              product_id: null,

              service_id:
                item.service_id,

              quantity:
                item.quantity,

              type: "service",

              name:
                item.service_name,

              service_name:
                item.service_name,

              description:
                item.service_description,

              min_price:
                item.service_min_price,

              max_price:
                item.service_max_price,

              image:
                item.service_image,

              category:
                item.service_category,
            };
          }
        );

        res.json(cart);
      }
    );
  }
);

// ======================================
// UPDATE CART QUANTITY
// PUT /api/cart/:cart_item_id
// ======================================

router.put(
  "/:cart_item_id",
  (req, res) => {
    const cart_item_id =
      req.params.cart_item_id;

    const {
      quantity,
    } = req.body;

    if (
      !quantity ||
      Number(quantity) < 1
    ) {
      return res.status(400).json({
        message:
          "Quantity must be at least 1",
      });
    }

    const query = `
      UPDATE cart_items
      SET quantity = ?
      WHERE cart_item_id = ?
    `;

    db.query(
      query,
      [
        quantity,
        cart_item_id,
      ],
      (err, result) => {
        if (err) {
          console.error(
            "UPDATE CART ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Unable to update quantity",
            error: err.message,
            sqlMessage: err.sqlMessage,
          });
        }

        if (
          result.affectedRows === 0
        ) {
          return res.status(404).json({
            message:
              "Cart item not found",
          });
        }

        res.json({
          success: true,
          message:
            "Quantity updated successfully",
          quantity:
            Number(quantity),
        });
      }
    );
  }
);

// ======================================
// DELETE CART ITEM
// DELETE /api/cart/:cart_item_id
// ======================================

router.delete(
  "/:cart_item_id",
  (req, res) => {
    const cart_item_id =
      req.params.cart_item_id;

    const query = `
      DELETE FROM cart_items
      WHERE cart_item_id = ?
    `;

    db.query(
      query,
      [cart_item_id],
      (err, result) => {
        if (err) {
          console.error(
            "DELETE CART ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Unable to remove cart item",
            error: err.message,
            sqlMessage: err.sqlMessage,
          });
        }

        if (
          result.affectedRows === 0
        ) {
          return res.status(404).json({
            message:
              "Cart item not found",
          });
        }

        res.json({
          success: true,
          message:
            "Cart item removed successfully",
        });
      }
    );
  }
);

module.exports = router;