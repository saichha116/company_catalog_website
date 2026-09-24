import { useState, useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import { auth } from "../../firebase/firebase";
import { signOut } from "firebase/auth";

import {
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaEdit,
} from "react-icons/fa";

function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();

  const getUser = () => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
    return null;
  };

  const [user, setUser] = useState(getUser());
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const currentUser = getUser();
    const currentUserId = currentUser?.id || currentUser?.user_id;
    if (!currentUserId) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const totalQty = data.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
          setCartCount(totalQty);
        } else {
          setCartCount(0);
        }
      }
    } catch (e) {
      console.error("Error fetching cart count:", e);
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getUser());
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    fetchCartCount();

    const handleCartChange = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-change", handleCartChange);

    return () => {
      window.removeEventListener("cart-change", handleCartChange);
    };
  }, [user]);

  const [showProfile, setShowProfile] = useState(false);

  const userName = user?.full_name || user?.name || "";
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");

  useEffect(() => {
    setEditName(user?.full_name || user?.name || "");
    setEditPhone(user?.phone || "");
    setEditEmail(user?.email || "");
  }, [user]);

  const handleEdit = () => {
    setEditName(user?.full_name || user?.name || "");
    setEditPhone(user?.phone || "");
    setEditEmail(user?.email || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      full_name: editName,
      name: editName,
      phone: editPhone,
      email: editEmail,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    window.dispatchEvent(new Event("auth-change"));

    alert("Profile updated successfully!");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log("Firebase signout error:", err);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setShowProfile(false);
    window.dispatchEvent(new Event("auth-change"));

    alert("You have been logged out!");
  };

  const userInitial = userName
    ? userName.charAt(0).toUpperCase()
    : "U";


  const triggerSearch = () => {
    const search = (searchTerm || "").trim();
    if (search) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
    } else {
      navigate("/products");
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      triggerSearch();
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 30px",
          background: "#fff",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            width: "600px",
          }}
        >
          <FaSearch
            onClick={triggerSearch}
            title="Search"
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#000",
              fontSize: "16px",
              cursor: "pointer",
            }}
          />

          <input
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            onKeyDown={handleSearch}
            style={{
              width: "100%",
              height: "45px",
              padding: searchTerm ? "0 45px 0 45px" : "0 20px 0 45px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "25px",
              outline: "none",
              backgroundColor: "#FAF3F3",
              color: "#000",
              boxSizing: "border-box",
            }}
          />

          {searchTerm && (
            <FaTimes
              onClick={() => {
                setSearchTerm("");
                navigate("/");
              }}
              title="Clear search"
              style={{
                position: "absolute",
                right: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#666",
                fontSize: "15px",
                cursor: "pointer",
              }}
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "36px",
            fontSize: "24px",
            color: "#000",
            alignItems: "center",
          }}
        >
          <Link
            to="/wishlist"
            style={{
              color: "#000",
              textDecoration: "none",
            }}
          >
            <FaHeart />
          </Link>

          <Link
            to="/cart"
            style={{
              color: "#000",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
            title="Shopping Cart"
          >
            <FaShoppingCart />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-10px",
                  backgroundColor: "#e53e3e",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  pointerEvents: "none",
                }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <div
            style={{
              position: "relative",
            }}
          >
            <div
              onClick={() =>
                setShowProfile(!showProfile)
              }
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: user ? "#000" : "#f0f2f5",
                color: user ? "#fff" : "#333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                overflow: "hidden",
                border: "1px solid #ddd",
              }}
              title={user ? userName : "Sign In"}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={userName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                userInitial
              )}
            </div>

            {showProfile && (
              <div
                style={{
                  position: "absolute",
                  right: "0",
                  top: "50px",
                  width: "300px",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  color: "#000",
                }}
              >
                <FaTimes
                  onClick={() =>
                    setShowProfile(false)
                  }
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "15px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                />

                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: user ? "#000" : "#f0f2f5",
                    color: user ? "#fff" : "#333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    fontWeight: "bold",
                    margin: "10px auto 15px",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={userName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    userInitial
                  )}
                </div>

                {!user ? (
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <h3 style={{ margin: "0 0 8px" }}>Welcome!</h3>
                    <p style={{ color: "#666", fontSize: "14px", margin: "0 0 16px" }}>
                      Sign in to access your profile, cart, and orders.
                    </p>
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/login");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#000",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "15px",
                      }}
                    >
                      Sign In / Register
                    </button>
                  </div>
                ) : isEditing ? (
                  <div>
                    <h3
                      style={{
                        textAlign: "center",
                        marginBottom: "20px",
                      }}
                    >
                      Edit Profile
                    </h3>

                    <label>Name</label>

                    <input
                      type="text"
                      value={editName}
                      onChange={(e) =>
                        setEditName(e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        marginBottom: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        boxSizing: "border-box",
                      }}
                    />

                    <label>Phone Number</label>

                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) =>
                        setEditPhone(e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        marginBottom: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        boxSizing: "border-box",
                      }}
                    />

                    <label>Email</label>

                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) =>
                        setEditEmail(e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "5px",
                        marginBottom: "15px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        boxSizing: "border-box",
                      }}
                    />

                    <button
                      onClick={handleSave}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#000",
                        color: "#fff",
                        cursor: "pointer",
                        marginBottom: "8px",
                      }}
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() =>
                        setIsEditing(false)
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "7px",
                        background: "#fff",
                        color: "#000",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3
                      style={{
                        textAlign: "center",
                        marginBottom: "20px",
                      }}
                    >
                      {userName}
                    </h3>

                    <p>
                      <strong>Name:</strong>{" "}
                      {userName}
                    </p>

                    {user.phone && (
                      <p>
                        <strong>Phone:</strong>{" "}
                        {user.phone}
                      </p>
                    )}

                    <p
                      style={{
                        wordBreak: "break-word",
                      }}
                    >
                      <strong>Email:</strong>{" "}
                      {user.email}
                    </p>

                    <button
                      onClick={handleEdit}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "10px",
                        border: "1px solid #000",
                        borderRadius: "7px",
                        background: "#fff",
                        color: "#000",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <FaEdit />
                      Edit Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "10px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#000",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "40px",
    padding: "15px 30px",
    background: "#fff",
    borderBottom: "1px solid #ddd",
  }}
>
  <NavLink
    to="/"
    end
    style={({ isActive }) => ({
      textDecoration: "none",
      color: "#000",
      fontSize: "25px",
      fontFamily: "Intel",
      position: "relative",
      paddingBottom: "8px",
    })}
  >
    {({ isActive }) => (
      <>
        Home
        {isActive && (
          <span
            style={{
              position: "absolute",
              left: "0",
              right: "0",
              bottom: "0",
              height: "3px",
              background: "#000",
              borderRadius: "2px",
            }}
          />
        )}
      </>
    )}
  </NavLink>

  <NavLink
    to="/about"
    style={{
      textDecoration: "none",
      color: "#000",
      fontSize: "25px",
      fontFamily: "Intel",
      position: "relative",
      paddingBottom: "8px",
    }}
  >
    {({ isActive }) => (
      <>
        About
        {isActive && (
          <span
            style={{
              position: "absolute",
              left: "0",
              right: "0",
              bottom: "0",
              height: "3px",
              background: "#000",
              borderRadius: "2px",
            }}
          />
        )}
      </>
    )}
  </NavLink>

  <NavLink
    to="/contact"
    style={{
      textDecoration: "none",
      color: "#000",
      fontSize: "25px",
      fontFamily: "Intel",
      position: "relative",
      paddingBottom: "8px",
    }}
  >
    {({ isActive }) => (
      <>
        Contact
        {isActive && (
          <span
            style={{
              position: "absolute",
              left: "0",
              right: "0",
              bottom: "0",
              height: "3px",
              background: "#000",
              borderRadius: "2px",
            }}
          />
        )}
      </>
    )}
  </NavLink>
</div>
    </>
  );
}

export default Navbar;