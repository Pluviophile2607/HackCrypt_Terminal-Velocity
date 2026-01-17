import React from "react";
import Navbar from "../components/Navbar";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Hero from "../components/Hero";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const Home = () => {
    return (
        <div className="h-screen bg-white dark:bg-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 overflow-hidden">
            <Navbar />

            <Swiper
                direction={"vertical"}
                slidesPerView={1}
                spaceBetween={0}
                mousewheel={true}
                pagination={{
                    clickable: true,
                }}
                modules={[Mousewheel, Pagination]}
                className="mySwiper h-full w-full"
            >
                <SwiperSlide className="h-full w-full flex items-center justify-center bg-transparent">
                    <Hero />
                </SwiperSlide>

                <SwiperSlide className="h-full w-full bg-transparent">
                    <div className="min-h-full flex flex-col">
                        <div className="flex-grow">
                            <Features />
                        </div>
                        <Footer />
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>
    );
};

export default Home;
