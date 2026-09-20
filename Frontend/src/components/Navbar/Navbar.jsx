import { useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.jpeg";

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
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      return JSON.parse(savedUser);
    }

    return null;
  };

  const [user, setUser] = useState(getUser());

  const [showProfile, setShowProfile] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");

  const handleEdit = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditEmail(user?.email || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: editName,
      phone: editPhone,
      email: editEmail,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setUser(updatedUser);
    setIsEditing(false);

    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowProfile(false);

    alert("You have been logged out!");
  };

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const search = searchTerm.trim();

      if (search) {
        navigate(
          `/products?search=${encodeURIComponent(search)}`
        );
      } else {
        navigate("/products");
      }
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
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#000",
              fontSize: "16px",
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
              padding: "0 20px 0 45px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "25px",
              outline: "none",
              backgroundColor: "#FAF3F3",
              color: "#000",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
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
            }}
          >
            <FaShoppingCart />
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
                background: "#000",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {userInitial}
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
                    background: "#000",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    fontWeight: "bold",
                    margin: "10px auto 15px",
                  }}
                >
                  {userInitial}
                </div>

                {!user ? (
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <h3>Welcome!</h3>
                    <p>
                      Please login to view your
                      profile.
                    </p>
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
                      {user.name}
                    </h3>

                    <p>
                      <strong>Name:</strong>{" "}
                      {user.name}
                    </p>

                    <p>
                      <strong>Phone:</strong>{" "}
                      {user.phone}
                    </p>

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