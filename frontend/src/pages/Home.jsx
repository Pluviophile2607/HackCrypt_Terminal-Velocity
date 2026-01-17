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
        <div className="h-[calc(100vh-5rem)] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">

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
                    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="flex-grow py-20">
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
