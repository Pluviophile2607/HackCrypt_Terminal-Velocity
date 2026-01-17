import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Stats from "../components/Stats";

import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination, Parallax } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const Home = () => {
    const [swiper, setSwiper] = useState(null);

    const scrollToFeatures = () => {
        if (swiper) {
            swiper.slideTo(1);
        }
    };

    return (
        <div className="h-[calc(100vh-5rem)] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">

            <Swiper
                direction={"vertical"}
                slidesPerView={1}
                spaceBetween={0}
                mousewheel={{
                    releaseOnEdges: true,
                    sensitivity: 1,
                    thresholdDelta: 10,
                    forceToAxis: true,
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                speed={1000}
                parallax={true}
                onSwiper={setSwiper}
                modules={[Mousewheel, Pagination, Parallax]}
                className="mySwiper h-full w-full"
            >
                <SwiperSlide className="h-full w-full flex items-center justify-center bg-transparent">
                    <div data-swiper-parallax="-300" className="w-full">
                        <Hero onScrollToFeatures={scrollToFeatures} />
                    </div>
                </SwiperSlide>

                <SwiperSlide className="h-full w-full bg-transparent overflow-hidden">
                    <div
                        data-swiper-parallax="-200"
                        className="h-full overflow-y-auto custom-scrollbar scroll-smooth"
                        onWheel={(e) => {
                            const target = e.currentTarget;
                            const atTop = target.scrollTop === 0;
                            const atBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;

                            // If we are at the top and scrolling up, let Swiper handle it (to go to Hero)
                            if (atTop && e.deltaY < 0) {
                                return;
                            }

                            // If we are at the bottom and scrolling down, let Swiper handle it (stay at bottom)
                            if (atBottom && e.deltaY > 0) {
                                return;
                            }

                            // Otherwise, stop propagation so the internal div scrolls
                            e.stopPropagation();
                        }}
                    >
                        <Stats />
                        <div className="flex-grow py-4">
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
