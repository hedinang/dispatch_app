import React, { Fragment, useState } from 'react'

import Slider from "react-slick";
import { Box } from '@material-ui/core';
import ArrowBackOutlinedIcon from '@material-ui/icons/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@material-ui/icons/ArrowForwardOutlined';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slick.css";

function ShipmentPhotos({photos}) {
  const [currentSlide, setCurrentSlide] = useState(1);

  const GalleryPrevArrow = ({ currentSlide, slideCount, ...props }) => {
    const { onClick } = props;

    return (
      <Box {...props} className={`custom-prevArrow ${currentSlide === 0 ? 'arrow-hiden' : ''}`} onClick={onClick}>
        <ArrowBackOutlinedIcon/>
      </Box>
    );
  };

  const GalleryNextArrow = ({ currentSlide, slideCount, ...props }) => {
      const { onClick } = props;

      return (
        <Box {...props} className={`custom-nextArrow ${photos && currentSlide === Math.ceil(photos.length / 2) ? 'arrow-hiden' : ''}`} onClick={onClick}>
          <ArrowForwardOutlinedIcon/>
        </Box>
      );
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    nextArrow: <GalleryNextArrow />,
    prevArrow: <GalleryPrevArrow />,
    afterChange: current => setCurrentSlide(current)
  };

  return (
    <Fragment>
      <Box position={'relative'} p={'0 16px'}>
        <Slider {...settings}>
          {photos && photos.map((photo, idx) => (
            <Box key={idx}>
              <img src={photo.url}  style={{margin: '0 auto', maxWidth: '100%', maxHeight: 350, minHeight: 250,}}/>
            </Box>
          ))}
        </Slider>
      </Box>
      <Box mb={2}></Box>
    </Fragment>
  )
}

export default ShipmentPhotos