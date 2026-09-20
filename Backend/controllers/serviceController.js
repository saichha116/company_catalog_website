const db = require("../config/db");

// ===============================
// Add Service
// ===============================

const addService = (req, res) => {
    const {
        service_name,
        category,
        description
    } = req.body;

    const image = req.file
        ? req.file.filename
        : null;

    const sql = `
        INSERT INTO services
        (
            service_name,
            category,
            description,
            image
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            service_name,
            category,
            description,
            image
        ],
        (err, result) => {
            if (err) {
                console.log("Service insert error:", err);

                return res.status(500).json({
                    message: "Service insert failed"
                });
            }

            res.status(201).json({
                message: "Service added successfully",
                service_id: result.insertId
            });
        }
    );
};


// ===============================
// Get All Services
// ===============================

const getServices = (req, res) => {
    const sql = `
        SELECT *
        FROM services
        ORDER BY service_id DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log("Fetch services error:", err);

            return res.status(500).json({
                message: "Failed to fetch services"
            });
        }

        res.json(result);
    });
};


// ===============================
// Delete Service
// ===============================

const deleteService = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM services
        WHERE service_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log("Service delete error:", err);

            return res.status(500).json({
                message: "Service delete failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service deleted successfully"
        });
    });
};


// ===============================
// Get Single Service
// ===============================

const getServiceById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT *
        FROM services
        WHERE service_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log("Fetch single service error:", err);

            return res.status(500).json({
                message: "Failed to fetch service"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json(result[0]);
    });
};


// ===============================
// Update Service
// ===============================

const updateService = (req, res) => {
    const { id } = req.params;

    const {
        service_name,
        category,
        description
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
            UPDATE services
            SET
                service_name=?,
                category=?,
                description=?,
                image=?
            WHERE service_id=?
        `;

        values = [
            service_name,
            category,
            description,
            image,
            id
        ];
    }


    // ===============================
    // UPDATE WITHOUT NEW IMAGE
    // ===============================

    else {
        sql = `
            UPDATE services
            SET
                service_name=?,
                category=?,
                description=?
            WHERE service_id=?
        `;

        values = [
            service_name,
            category,
            description,
            id
        ];
    }


    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("Service update error:", err);

            return res.status(500).json({
                message: "Service update failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service updated successfully"
        });
    });
};


// ===============================
// EXPORT
// ===============================

module.exports = {
    addService,
    getServices,
    deleteService,
    getServiceById,
    updateService
};