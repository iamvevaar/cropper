import React, { useRef, useState } from 'react'
import JSZip from 'jszip';
import Slider from 'react-slick';
import { ClipLoader } from 'react-spinners';
import "./crops.css"
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Cropper = () => {
    const [inputImage, setInputImage] = useState(null);
  const [croppedImages, setCroppedImages] = useState([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputImageDimensions, setInputImageDimensions] = useState(null);

  const linkRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    const imageUrl = URL.createObjectURL(file);
    setInputImage(imageUrl);

    // setInputImage(URL.createObjectURL(file));
    setErrorMessage('');
    
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      setInputImageDimensions({ width: img.width, height: img.height });
    };

  };

  const handleCrop = () => {
    setProgress(0);
    setLoading(true);
    const img = new Image();
    img.src = inputImage;

    img.onload = () => {
        setLoading(false);
      if (img.height !== 1080 && img.width !== 1350) {
        setErrorMessage('Error: Image height must be 1080 or 1350 pixels.');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;

      const context = canvas.getContext('2d');

      const newCroppedImages = [];

      for (let x = 0; x < img.width; x += 1080) {
        for (let y = 0; y < img.height; y += 1080) {
          context.clearRect(0, 0, 1080, 1080);
          context.drawImage(img, x, y, 1080, 1080, 0, 0, 1080, 1080);

          const dataUrl = canvas.toDataURL('image/png');
          newCroppedImages.push(dataUrl);

           // Update progress
           setProgress((prevProgress) => prevProgress + 100 / (img.width / 1080));
        }
      }

      setCroppedImages(newCroppedImages);
      setShowCarousel(true);
    };
  };

  const handleDownloadAll = () => {
    croppedImages.forEach((dataUrl, index) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cropped_image_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleDownloadAllZip = () => {
    const zip = new JSZip();
    
    croppedImages.forEach((dataUrl, index) => {
      zip.file(`cropped_image_${index + 1}.png`, dataUrl.split(';base64,').pop(), { base64: true });
    });

    // zip.generateAsync({ type: 'blob' }).then((content) => {
    //   const link = document.createElement('a');
    //   link.href = URL.createObjectURL(content);
    //   link.download = 'cropped_images.zip';
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    // });
    zip.generateAsync({ type: 'blob' }).then((content) => {
        const url = URL.createObjectURL(content);
        linkRef.current.href = url;
        linkRef.current.download = 'cropped_images.zip';
        linkRef.current.click();
        URL.revokeObjectURL(url); // free up storage--no longer needed.
      });
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div>
      <h1>Carousell Cropper</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {inputImage && (
        <div>
          <img src={inputImage} alt="Input" style={{ maxWidth: '100%' }} />

          {console.log(inputImageDimensions)}
          
          {inputImageDimensions && (
            <p>
              Image Dimensions: {inputImageDimensions.width} x {inputImageDimensions.height} pixels
            </p>
          )}
          
          <button onClick={handleCrop}>Crop</button>
          {loading && <ClipLoader color="#000" />}
          {showCarousel && (
            <div className='check' style={{height:"1080px" , width:"1080px"}}>
              <Slider {...settings}>
                {croppedImages.map((cropped, index) => (
                  <div key={index}>
                    <img
                      src={cropped}
                      alt={`Cropped ${index + 1}`}
                    />
                  </div>
                ))}
              </Slider>
              <a ref={linkRef} style={{ display: 'none' }}>hidden</a>
              <div style={{marginTop:"24px"}}>

                <button onClick={handleDownloadAll}>Download All</button>
                <button onClick={handleDownloadAllZip}>Download All As Zip</button>
              
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Cropper