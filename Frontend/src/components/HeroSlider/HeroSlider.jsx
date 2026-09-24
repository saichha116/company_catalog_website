import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./HeroSlider.css";

import slider1 from "../../assets/slider1.jpeg";
import slider2 from "../../assets/slider2.png";
import slider3 from "../../assets/slider3.jpeg";

function HeroSlider() {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      autoplay={{ delay: 3000 }}
      navigation
      pagination={{ clickable: true }}
      loop={true}
      className="hero-swiper"
    >
      <SwiperSlide>
        <img src={slider1} alt="Slide 1" />
      </SwiperSlide>

      <SwiperSlide>
        <img src={slider2} alt="Slide 2" />
      </SwiperSlide>

      <SwiperSlide>
        <img src={slider3} alt="Slide 3" />
      </SwiperSlide>
    </Swiper>
  );
}

export default HeroSlider;