import { useState } from "react";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    rating: "",
    feedback: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            rating: Number(formData.rating),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Feedback submitted successfully!");

        setFormData({
          full_name: "",
          email: "",
          rating: "",
          feedback: "",
        });

        setTimeout(() => {
          setMessage("");
        }, 5000);
      } else {
        setMessage(
          data.message || "Something went wrong."
        );
      }
    } catch (error) {
      console.error("Submit error:", error);

      setMessage(
        "❌ Unable to submit feedback. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">

      {/* ================= HERO SECTION ================= */}

      <div className="contact-hero">
        <div className="contact-hero-content">

          <span className="contact-small-title">
            GET IN TOUCH
          </span>

          <h1>
            Let's Talk About Your Project
          </h1>

          <p>
            Have a question, or want to discuss your
            printing requirements? We're here to help.
          </p>

        </div>
      </div>


      {/* ================= CONTACT INFORMATION ================= */}

      <div className="contact-wrapper">

        <div className="contact-heading">

          <span>
            CONTACT INFORMATION
          </span>

          <h2>
            We'd Love To Hear From You
          </h2>

          <p>
            Reach out to us through any of the options below.
            Our team will be happy to assist you.
          </p>

        </div>


        <div className="contact-info">

          {/* ADDRESS */}

          <div className="contact-card">

            <div className="contact-icon-box">
              <span>📍</span>
            </div>

            <div>
              <h3>
                Our Address
              </h3>

              <p>
                Ponda, Goa
                <br />
                403401
              </p>
            </div>

          </div>


          {/* PHONE */}

          <div className="contact-card">

            <div className="contact-icon-box">
              <span>☎</span>
            </div>

            <div>
              <h3>
                Call Us
              </h3>

              <p>
                +91 8806453029
              </p>
            </div>

          </div>


          {/* EMAIL */}

          <div className="contact-card">

            <div className="contact-icon-box">
              <span>✉</span>
            </div>

            <div>
              <h3>
                Email Us
              </h3>

              <p>
                inquiry@imscad.co.in
              </p>
            </div>

          </div>

        </div>


        {/* ================= FEEDBACK SECTION ================= */}

        <div className="contact-form-section">

          {/* ================= LEFT SIDE ================= */}

          <div className="contact-form-intro">

            <span>
              YOUR FEEDBACK MATTERS
            </span>

            <h2>
              Help Us
              <br />
              Improve Our Service.
            </h2>

            <p>
              We value your opinion. Share your experience
              with us and let us know how we can serve
              you better.
            </p>

            <div className="contact-divider"></div>

            <div className="quick-contact">

              <strong>
                We appreciate your feedback
              </strong>

              <p>
                Your suggestions help us improve our
                printing, branding, sign boards and
                stationery services.
              </p>

            </div>

          </div>


          {/* ================= RIGHT SIDE ================= */}

          <div className="contact-form-container">

            <h2>
              Share Your Feedback
            </h2>

            <p className="form-subtitle">
              Tell us about your experience with our services.
            </p>


            {/* ================= FORM ================= */}

            <form onSubmit={handleSubmit}>

              {/* NAME + EMAIL */}

              <div className="form-row">

                {/* NAME */}

                <div className="input-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="input-group">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />

                </div>

              </div>


              {/* ================= RATING ================= */}

              <div className="input-group">

                <label>
                  How was your experience?
                </label>

                <div className="feedback-rating">

                  {/* POOR */}

                  <label className="rating-option">

                    <input
                      type="radio"
                      name="rating"
                      value="1"
                      checked={
                        formData.rating === "1"
                      }
                      onChange={handleChange}
                      required
                    />

                    <span>
                      😞
                    </span>

                    <small>
                      Poor
                    </small>

                  </label>


                  {/* AVERAGE */}

                  <label className="rating-option">

                    <input
                      type="radio"
                      name="rating"
                      value="2"
                      checked={
                        formData.rating === "2"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      😐
                    </span>

                    <small>
                      Average
                    </small>

                  </label>


                  {/* GOOD */}

                  <label className="rating-option">

                    <input
                      type="radio"
                      name="rating"
                      value="3"
                      checked={
                        formData.rating === "3"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      🙂
                    </span>

                    <small>
                      Good
                    </small>

                  </label>


                  {/* EXCELLENT */}

                  <label className="rating-option">

                    <input
                      type="radio"
                      name="rating"
                      value="4"
                      checked={
                        formData.rating === "4"
                      }
                      onChange={handleChange}
                    />

                    <span>
                      😍
                    </span>

                    <small>
                      Excellent
                    </small>

                  </label>

                </div>

              </div>


              {/* ================= FEEDBACK ================= */}

              <div className="input-group">

                <label>
                  Your Feedback
                </label>

                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  placeholder="Tell us what you liked or how we can improve..."
                  required
                ></textarea>

              </div>


              {/* ================= SUBMIT BUTTON ================= */}

              <button
                type="submit"
                className="send-button"
                disabled={loading}
              >

                {loading
                  ? "SUBMITTING..."
                  : "SUBMIT FEEDBACK"}

                {!loading && (
                  <span>
                    →
                  </span>
                )}

              </button>

            </form>


            {/* ================= MESSAGE ================= */}

            {message && (
              <p className="feedback-message">
                {message}
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Contact;