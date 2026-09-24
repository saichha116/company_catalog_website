import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "./Products.css";

function Products() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // Get Products + Services
    // ==========================================

    const fetchItems = async () => {
        try {
            const [productsResponse, servicesResponse] =
                await Promise.all([
                    axios.get(
                        "http://localhost:5000/api/products"
                    ),
                    axios.get(
                        "http://localhost:5000/api/services"
                    )
                ]);

            const products = productsResponse.data.map(
                (product) => ({
                    ...product,
                    type: "Product",
                    item_id: product.product_id,
                    item_name: product.product_name,
                    item_category:
                        product.category_name || "—",
                    item_subcategory:
                        product.subcategory_name || "—",
                    item_stock:
                        product.stock ?? "—"
                })
            );

            const services = servicesResponse.data.map(
                (service) => ({
                    ...service,
                    type: "Service",
                    item_id: service.service_id,
                    item_name: service.service_name,
                    item_category:
                        service.category || "—",
                    item_subcategory: "—",
                    item_stock: "—"
                })
            );

            setItems([...products, ...services]);
        } catch (error) {
            console.log(
                "Failed to fetch products/services:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // ==========================================
    // Delete Product / Service
    // ==========================================

    const handleDelete = async (item) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete this ${item.type.toLowerCase()}?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            if (item.type === "Product") {
                await axios.delete(
                    `http://localhost:5000/api/products/${item.product_id}`
                );
            } else {
                await axios.delete(
                    `http://localhost:5000/api/services/${item.service_id}`
                );
            }

            setItems((prevItems) =>
                prevItems.filter(
                    (currentItem) =>
                        !(
                            currentItem.type === item.type &&
                            currentItem.item_id === item.item_id
                        )
                )
            );

            alert(
                `${item.type} deleted successfully`
            );
        } catch (error) {
            console.log(
                "Delete error:",
                error
            );

            alert(
                `${item.type} delete failed`
            );
        }
    };

    // ==========================================
    // Loading
    // ==========================================

    if (loading) {
        return (
            <div className="dashboard-layout">
                <AdminSidebar />

                <div className="dashboard-content">
                    <h1>
                        Product & Service Management
                    </h1>

                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="dashboard-layout">

            <AdminSidebar />

            <div className="dashboard-content">

                {/* Header */}
                <div className="product-header">

                    <h1>
                        Product & Service Management
                    </h1>

                    <Link to="/admin/add-product">
                        <button
                            type="button"
                            className="add-btn"
                        >
                            + Add Product / Service
                        </button>
                    </Link>

                </div>

                {/* Table */}
                <table className="product-table">

                    <thead>
                        <tr>

                            <th>ID</th>

                            <th>Type</th>

                            <th>Image</th>

                            <th>Name</th>

                            <th>Category</th>

                            <th>Subcategory</th>

                            <th>Stock</th>

                            <th>Actions</th>

                        </tr>
                    </thead>

                    <tbody>

                        {items.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="8"
                                    style={{
                                        textAlign: "center"
                                    }}
                                >
                                    No products or services
                                    found.
                                </td>

                            </tr>

                        ) : (

                            items.map((item) => (

                                <tr
                                    key={`${item.type}-${item.item_id}`}
                                >

                                    {/* ID */}
                                    <td>
                                        {item.item_id}
                                    </td>

                                    {/* Type */}
                                    <td>
                                        <strong>
                                            {item.type}
                                        </strong>
                                    </td>

                                    {/* Image */}
                                    <td>

                                        {item.image ? (

                                            <img
                                                src={`http://localhost:5000/uploads/${item.image}`}
                                                width="50"
                                                height="50"
                                                alt={item.item_name}
                                                style={{
                                                    objectFit:
                                                        "cover"
                                                }}
                                            />

                                        ) : (

                                            "No Image"

                                        )}

                                    </td>

                                    {/* Name */}
                                    <td>
                                        {item.item_name}
                                    </td>

                                    {/* Category */}
                                    <td>
                                        {item.item_category}
                                    </td>

                                    {/* Subcategory */}
                                    <td>
                                        {item.item_subcategory}
                                    </td>

                                    {/* Stock */}
                                    <td>
                                        {item.item_stock}
                                    </td>

                                    {/* Actions */}
                                    <td>

                                        {/* Edit */}
                                        <Link
                                            to={`/admin/edit-product/${item.item_id}?type=${item.type.toLowerCase()}`}
                                        >
                                            <button
                                                type="button"
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                        </Link>

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDelete(
                                                    item
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Products;