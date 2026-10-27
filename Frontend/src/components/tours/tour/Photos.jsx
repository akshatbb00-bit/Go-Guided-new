import { useState } from "react";
import { RxCross2 } from "react-icons/rx";

export default function ImageGallery({ images }) {
  const [galleryState, setGalleryState] = useState({
    isOpen: false, // Gallery modal state
    selectedIndex: null, // Single Image Viewer state
  });

  // Open gallery modal
  const openGallery = () =>
    setGalleryState({ isOpen: true, selectedIndex: null });

  // Close gallery modal
  const closeGallery = () =>
    setGalleryState({ isOpen: false, selectedIndex: null });

  // Open full-screen image viewer
  const openImageViewer = (index) => {
    setGalleryState((prevState) => ({
      ...prevState,
      selectedIndex: index, // Open image but remember if gallery was open
    }));
  };

  // Close full-screen viewer: If gallery was open, return to it
  const closeImageViewer = () => {
    setGalleryState((prevState) => ({
      isOpen: prevState.isOpen, // Keep gallery open if it was open
      selectedIndex: null, // Just close the image preview
    }));
  };

  return (
    <div className="shadow-md relative shadow-black/80 rounded-lg w-full md:w-auto">
      {/* Image Grid */}
      <div className="h-[350px] md:h-[500px] grid grid-rows-2 grid-cols-1 md:grid-cols-[0.60fr_0.40fr] gap-1 rounded-lg overflow-hidden">
        <div className="row-span-1 md:row-span-2 overflow-hidden rounded-lg">
          <img
            src={images[0].url}
            alt="Gallery Image 1"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openImageViewer(0)}
          />
        </div>
        <div className="overflow-hidden rounded-lg">
          <img
            src={images[1]?.url}
            alt="Gallery Image 2"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openImageViewer(1)}
          />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="overflow-hidden rounded-lg">
            <img
              src={images[2]?.url}
              alt="Gallery Image 3"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openImageViewer(2)}
            />
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={images[3]?.url}
              alt="Gallery Image 4"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openImageViewer(3)}
            />
            <button
              onClick={openGallery}
              className="absolute z-10 right-3 bottom-2 bg-green-600 text-white py-2 px-3 rounded-lg cursor-pointer 
            transition duration-300 hover:bg-green-700 hover:shadow-md"
              aria-label="See all photos"
            >
              See all Photos
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryState.isOpen && galleryState.selectedIndex === null && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-10 animate-fadeIn px-4 md:px-2 ">
          <div className="relative bg-green-50 p-8 md:p-2 rounded-lg max-w-5xl w-full md:w-auto h-[500px] md:h-[600px] shadow-lg overflow-auto scrollbar-none">
            <div className="grid grid-cols-2 gap-2 h-full">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  className="w-full h-full object-cover object-center rounded-lg cursor-pointer transition-transform duration-300"
                  onClick={() => openImageViewer(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={closeGallery}
              className="absolute top-5 right-5  transform translate-x-1/2 -translate-y-1/2 bg-green-950 text-green-50 p-2 rounded-full cursor-pointer transition duration-300 hover:bg-green-900"
              aria-label="Close gallery"
            >
              <RxCross2 size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen Image Viewer */}
      {galleryState.selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-20 animate-fadeIn p-5"
          onClick={closeImageViewer} // Click anywhere to close
        >
          <div className="relative bg-green-50 p-0.5 rounded-lg shadow-lg max-w-5xl w-full md:w-auto h-[400px] md:h-[600px]">
            <button
              onClick={closeImageViewer}
              className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2 bg-green-950 text-green-50 p-2 rounded-full cursor-pointer transition duration-300 hover:bg-green-950"
              aria-label="Close image viewer"
            >
              <RxCross2 size={24} />
            </button>
            <img
              src={images[galleryState.selectedIndex].url}
              className="w-full h-full object-cover rounded-lg shadow-lg transition-transform duration-500 ease-in-out"
              alt="Full view"
            />
          </div>
        </div>
      )}
    </div>
  );
}
