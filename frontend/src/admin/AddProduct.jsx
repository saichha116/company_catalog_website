import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import "./AddProduct.css";

function AddProduct() {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [mainCategory, setMainCategory] = useState("");

    const navigate = useNavigate();

    const [product, setProduct] = useState({
        category_id: "",
        subcategory_id: "",
        product_name: "",
        description: "",
        stock: ""
    });

    const [service, setService] = useState({
        service_name: "",
        category: "",
        description: ""
    });

    const [image, setImage] = useState(null);

    // ==========================================
    // Get Categories
    // ==========================================

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/categories")
            .then((res) => {
                setCategories(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    // ==========================================
    // Get Subcategories
    // ==========================================

    useEffect(() => {
        if (
            mainCategory !== "1" ||
            !product.category_id
        ) {
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
    }, [product.category_id, mainCategory]);

    // ==========================================
    // Main Category Change
    // ==========================================

    const handleMainCategoryChange = (e) => {
        const value = e.target.value;

        setMainCategory(value);

        setProduct({
            ...product,
            category_id: "",
            subcategory_id: ""
        });

        setService({
            ...service,
            category: ""
        });

        setSubcategories([]);
    };

    // ==========================================
    // Product Category Change
    // ==========================================

    const handleCategoryChange = (e) => {
        setProduct({
            ...product,
            category_id: e.target.value,
            subcategory_id: ""
        });
    };

    // ==========================================
    // Product Input Change
    // ==========================================

    const handleProductChange = (e) => {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    };

    // ==========================================
    // Service Input Change
    // ==========================================

    const handleServiceChange = (e) => {
        setService({
            ...service,
            [e.target.name]: e.target.value
        });
    };

    // ==========================================
    // Submit
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // ======================================
        // SERVICE
        // ======================================

        if (mainCategory === "2") {
            formData.append(
                "service_name",
                service.service_name
            );

            formData.append(
                "category",
                service.category
            );

            formData.append(
                "description",
                service.description
            );

            if (image) {
                formData.append(
                    "image",
                    image
                );
            }

            try {
                const response = await axios.post(
                    "http://localhost:5000/api/services",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

                console.log(response.data);

                alert(
                    "Service Added Successfully"
                );

                navigate("/admin/products");
            } catch (error) {
                console.log(error);

                alert("Service Add Failed");
            }

            return;
        }

        // ======================================
        // PRODUCT
        // ======================================

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
            formData.append(
                "image",
                image
            );
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/products",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            console.log(response.data);

            alert(
                "Product Added Successfully"
            );

            navigate("/admin/products");
        } catch (error) {
            console.log(error);

            alert("Product Add Failed");
        }
    };

    return (
        <div className="dashboard-layout">

            <AdminSidebar />

            <div className="dashboard-content">

                <h1>
                    {mainCategory === "2"
                        ? "Add Service"
                        : "Add Product"}
                </h1>

                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================
                        SERVICE / PRODUCT NAME
                    ================================= */}

                    {mainCategory === "2" ? (
                        <input
                            type="text"
                            name="service_name"
                            value={service.service_name}
                            placeholder="Service Name"
                            onChange={
                                handleServiceChange
                            }
                            required
                        />
                    ) : (
                        <input
                            type="text"
                            name="product_name"
                            value={product.product_name}
                            placeholder="Product Name"
                            onChange={
                                handleProductChange
                            }
                            required
                        />
                    )}

                    {/* =================================
                        MAIN CATEGORY
                    ================================= */}

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

                    {/* =================================
                        PRODUCT CATEGORY
                    ================================= */}

                    {mainCategory === "1" && (
                        <select
                            name="category_id"
                            value={
                                product.category_id
                            }
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
                                        ) === "1"
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

                    {/* =================================
                        SERVICE CATEGORY
                    ================================= */}

                    {mainCategory === "2" && (
                        <select
                            name="category"
                            value={service.category}
                            onChange={
                                handleServiceChange
                            }
                            required
                        >
                            <option value="">
                                Select Service Category
                            </option>

                            <option value="Printing">
                                Printing
                            </option>

                            <option value="Branding">
                                Branding
                            </option>

                            <option value="Fabrication">
                                Fabrication
                            </option>

                            <option value="Book Binding">
                                Book Binding
                            </option>
                        </select>
                    )}

                    {/* =================================
                        DESCRIPTION
                    ================================= */}

                    <textarea
                        name="description"
                        value={
                            mainCategory === "2"
                                ? service.description
                                : product.description
                        }
                        placeholder={
                            mainCategory === "2"
                                ? "Service Description"
                                : "Product Description"
                        }
                        onChange={
                            mainCategory === "2"
                                ? handleServiceChange
                                : handleProductChange
                        }
                    />

                    {/* =================================
                        SUBCATEGORY
                    ================================= */}

                    {mainCategory === "1" &&
                        subcategories.length > 0 && (
                            <select
                                name="subcategory_id"
                                value={
                                    product.subcategory_id
                                }
                                onChange={
                                    handleProductChange
                                }
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

                    {/* =================================
                        STOCK - PRODUCTS ONLY
                    ================================= */}

                    {mainCategory === "1" && (
                        <input
                            type="number"
                            name="stock"
                            value={product.stock}
                            placeholder="Stock Quantity"
                            onChange={
                                handleProductChange
                            }
                        />
                    )}

                    {/* =================================
                        IMAGE
                    ================================= */}

                    <input
                        type="file"
                        onChange={(e) =>
                            setImage(
                                e.target.files[0]
                            )
                        }
                    />

                    {/* =================================
                        SAVE BUTTON
                    ================================= */}

                    <button type="submit">
                        {mainCategory === "2"
                            ? "Save Service"
                            : "Save Product"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default AddProduct;