import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "./AddProduct.css";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        category_id: "",
        subcategory_id: "",
        product_name: "",
        description: "",
        stock: ""
    });

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [mainCategory, setMainCategory] = useState("");
    const [image, setImage] = useState(null);

    // ============================
    // Get Product + Categories
    // ============================
    useEffect(() => {
        // Get product
        axios
            .get(`http://localhost:5000/api/products/${id}`)
            .then((res) => {
                const data = res.data;

                setProduct({
                    category_id: data.category_id || "",
                    subcategory_id: data.subcategory_id || "",
                    product_name: data.product_name || "",
                    description: data.description || "",
                    stock: data.stock || ""
                });

                // Set main category
                if (data.main_category_id) {
                    setMainCategory(
                        String(data.main_category_id)
                    );
                }
            })
            .catch((err) => {
                console.log(err);
            });

        // Get categories
        axios
            .get("http://localhost:5000/api/categories")
            .then((res) => {
                setCategories(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [id]);

    // ============================
    // Get Subcategories
    // ============================
    useEffect(() => {
        if (!product.category_id) {
            setSubcategories([]);
            return;
        }

        axios
            .get(
                `http://localhost:5000/api/subcategories/category/${product.category_id}`
            )
            .then((res) => {
                setSubcategories(res.data);
            })
            .catch((err) => {
                console.log(err);
                setSubcategories([]);
            });
    }, [product.category_id]);

    // ============================
    // Set Main Category
    // ============================
    useEffect(() => {
        if (
            product.category_id &&
            categories.length > 0
        ) {
            const selectedCategory = categories.find(
                (cat) =>
                    String(cat.category_id) ===
                    String(product.category_id)
            );

            if (selectedCategory) {
                setMainCategory(
                    String(
                        selectedCategory.main_category_id
                    )
                );
            }
        }
    }, [product.category_id, categories]);

    // ============================
    // Handle Changes
    // ============================
    const handleChange = (e) => {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    };

    // ============================
    // Main Category Change
    // ============================
    const handleMainCategoryChange = (e) => {
        const value = e.target.value;

        setMainCategory(value);

        setProduct({
            ...product,
            category_id: "",
            subcategory_id: ""
        });

        setSubcategories([]);
    };

    // ============================
    // Category Change
    // ============================
    const handleCategoryChange = (e) => {
        setProduct({
            ...product,
            category_id: e.target.value,
            subcategory_id: ""
        });
    };

    // ============================
    // Submit
    // ============================
    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append(
            "category_id",
            product.category_id
        );

        formData.append(
            "subcategory_id",
            product.subcategory_id
        );

        formData.append(
            "product_name",
            product.product_name
        );

        formData.append(
            "description",
            product.description
        );

        formData.append(
            "stock",
            product.stock
        );

        if (image) {
            formData.append("image", image);
        }

        axios
            .put(
                `http://localhost:5000/api/products/${id}`,
                formData
            )
            .then(() => {
                alert("Product updated successfully");

                navigate("/admin/products");
            })
            .catch((err) => {
                console.log(err);

                alert("Product update failed");
            });
    };

    return (
        <div className="dashboard-layout">

            <AdminSidebar />

            <div className="dashboard-content">

                <h1>
                    {mainCategory === "2"
                        ? "Edit Service"
                        : "Edit Product"}
                </h1>

                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >

                    {/* Main Category */}

                    <select
                        value={mainCategory}
                        onChange={
                            handleMainCategoryChange
                        }
                        required
                    >
                        <option value="">
                            Select Main Category
                        </option>

                        <option value="1">
                            Products
                        </option>

                        <option value="2">
                            Services
                        </option>
                    </select>

                    {/* Category */}

                    {mainCategory && (
                        <select
                            name="category_id"
                            value={product.category_id}
                            onChange={
                                handleCategoryChange
                            }
                            required
                        >
                            <option value="">
                                Select Category
                            </option>

                            {categories
                                .filter(
                                    (cat) =>
                                        String(
                                            cat.main_category_id
                                        ) ===
                                        String(
                                            mainCategory
                                        )
                                )
                                .map((cat) => (
                                    <option
                                        key={
                                            cat.category_id
                                        }
                                        value={
                                            cat.category_id
                                        }
                                    >
                                        {
                                            cat.category_name
                                        }
                                    </option>
                                ))}
                        </select>
                    )}

                    {/* Product / Service Name */}

                    <input
                        name="product_name"
                        value={product.product_name}
                        placeholder="Product Name"
                        onChange={handleChange}
                        required
                    />

                    {/* Description */}

                    <textarea
                        name="description"
                        value={product.description}
                        placeholder="Description"
                        onChange={handleChange}
                    />

                    {/* Subcategory */}

                    {subcategories.length > 0 && (
                        <select
                            name="subcategory_id"
                            value={product.subcategory_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Subcategory
                            </option>

                            {subcategories.map(
                                (sub) => (
                                    <option
                                        key={
                                            sub.subcategory_id
                                        }
                                        value={
                                            sub.subcategory_id
                                        }
                                    >
                                        {
                                            sub.subcategory_name
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    )}

                    {/* Stock */}

                    <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        placeholder="Stock"
                        onChange={handleChange}
                    />

                    {/* Image */}

                    <input
                        type="file"
                        onChange={(e) =>
                            setImage(
                                e.target.files[0]
                            )
                        }
                    />

                    {/* Button */}

                    <button type="submit">
                        {mainCategory === "2"
                            ? "Update Service"
                            : "Update Product"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default EditProduct;