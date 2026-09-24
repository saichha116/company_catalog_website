import bannerImage from "../assets/product-banner.jpg";
import "../styles/HeroSection.css";

function HeroSection() {
  return (
    <section
      className="product-hero-banner"
      style={{
        backgroundImage: `url(${bannerImage})`,
      }}
    >
      <div className="product-hero-content">
        <h1>PRODUCT</h1>
      </div>
    </section>
  );
}

export default HeroSection;