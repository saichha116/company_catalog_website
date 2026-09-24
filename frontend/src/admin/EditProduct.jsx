import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "./AddProduct.css";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const itemType = searchParams.get("type") || "product";
    const isService = itemType === "service";

    // ==========================================
    // Product State
    // ==========================================

    const [product, setProduct] = useState({
        category_id: "",
        subcategory_id: "",
        product_name: "",
        description: "",
        stock: ""
    });

    // ==========================================
    // Service State
    // ==========================================

    const [service, setService] = useState({
        service_name: "",
        category: "",
        description: ""
    });

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [image, setImage] = useState(null);

    const [loading, setLoading] = useState(true);

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
                console.log(
                    "Category fetch error:",
                    err
                );
            });
    }, []);

    // ==========================================
    // Get Product / Service
    // ==========================================

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);

                if (isService) {
                    // ==============================
                    // GET SERVICE
                    // ==============================

                    const response = await axios.get(
                        `http://localhost:5000/api/services/${id}`
                    );

                    const data = response.data;

                    setService({
                        service_name:
                            data.service_name || "",
                        category:
                            data.category || "",
                        description:
                            data.description || ""
                    });
                } else {
                    // ==============================
                    // GET PRODUCT
                    // ==============================

                    const response = await axios.get(
                        `http://localhost:5000/api/products/${id}`
                    );

                    const data = response.data;

                    setProduct({
                        category_id:
                            data.category_id || "",
                        subcategory_id:
                            data.subcategory_id || "",
                        product_name:
                            data.product_name || "",
                        description:
                            data.description || "",
                        stock:
                            data.stock ?? ""
                    });
                }
            } catch (error) {
                console.log(
                    "Fetch item error:",
                    error
                );

                alert(
                    `Failed to load ${
                        isService
                            ? "service"
                            : "product"
                    }.`
                );
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id, isService]);

    // ==========================================
    // Get Product Subcategories
    // ==========================================

    useEffect(() => {
        if (
            isService ||
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
                console.log(
                    "Subcategory fetch error:",
                    err
                );

                setSubcategories([]);
            });
    }, [product.category_id, isService]);

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
    // Submit
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // ======================================
            // UPDATE SERVICE
            // ======================================

            if (isService) {
                const formData = new FormData();

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

                await axios.put(
                    `http://localhost:5000/api/services/${id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

                alert(
                    "Service updated successfully"
                );

                navigate("/admin/products");

                return;
            }

            // ======================================
            // UPDATE PRODUCT
            // ======================================

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
                formData.append(
                    "image",
                    image
                );
            }

            await axios.put(
                `http://localhost:5000/api/products/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            alert(
                "Product updated successfully"
            );

            navigate("/admin/products");

        } catch (error) {
            console.log(
                "Update error:",
                error
            );

            alert(
                `${
                    isService
                        ? "Service"
                        : "Product"
                } update failed`
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
                        Loading...
                    </h1>
                </div>
            </div>
        );
    }

    // ==========================================
    // SERVICE EDIT PAGE
    // ==========================================

    if (isService) {
        return (
            <div className="dashboard-layout">

                <AdminSidebar />

                <div className="dashboard-content">

                    <h1>
                        Edit Service
                    </h1>

                    <form
                        className="product-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Service Name */}

                        <input
                            type="text"
                            name="service_name"
                            value={
                                service.service_name
                            }
                            placeholder="Service Name"
                            onChange={
                                handleServiceChange
                            }
                            required
                        />

                        {/* Service Category */}

                        <select
                            name="category"
                            value={
                                service.category
                            }
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

                        {/* Description */}

                        <textarea
                            name="description"
                            value={
                                service.description
                            }
                            placeholder="Service Description"
                            onChange={
                                handleServiceChange
                            }
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

                        {/* Update */}

                        <button type="submit">
                            Update Service
                        </button>

                    </form>

                </div>

            </div>
        );
    }

    // ==========================================
    // PRODUCT EDIT PAGE
    // ==========================================

    return (
        <div className="dashboard-layout">

            <AdminSidebar />

            <div className="dashboard-content">

                <h1>
                    Edit Product
                </h1>

                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >

                    {/* Product Category */}

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

                    {/* Product Name */}

                    <input
                        type="text"
                        name="product_name"
                        value={
                            product.product_name
                        }
                        placeholder="Product Name"
                        onChange={
                            handleProductChange
                        }
                        required
                    />

                    {/* Description */}

                    <textarea
                        name="description"
                        value={
                            product.description
                        }
                        placeholder="Product Description"
                        onChange={
                            handleProductChange
                        }
                    />

                    {/* Subcategory */}

                    {subcategories.length > 0 && (

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

                    {/* Stock */}

                    <input
                        type="number"
                        name="stock"
                        value={
                            product.stock
                        }
                        placeholder="Stock"
                        onChange={
                            handleProductChange
                        }
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

                    {/* Update */}

                    <button type="submit">
                        Update Product
                    </button>

                </form>

            </div>

        </div>
    );
}

export default EditProduct;