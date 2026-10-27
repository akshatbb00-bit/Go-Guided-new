import { useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLinkedin,
  FaCopy,
} from "react-icons/fa";

function ShareModal({ isOpen, setIsModalOpen, shareUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-2 right-2 text-green-600 hover:text-green-900 cursor-pointer"
        >
          <IoClose size={30} />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold mb-4 text-green-950">
          Share This Page
        </h2>

        {/* Share Link Section */}
        <div className="flex items-center border p-2 rounded-lg">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-grow p-1 outline-none text-green-950 truncate"
          />
          <button
            onClick={handleCopy}
            className="ml-2 text-green-600 hover:text-green-800"
            aria-label="Copy link"
          >
            <FaCopy size={20} />
          </button>
        </div>
        {copied && <p className="text-green-500 mt-2">Link copied!</p>}

        {/* Social Media Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
            aria-label="Share on Facebook"
          >
            <FaFacebook size={30} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-600"
            aria-label="Share on Twitter"
          >
            <FaTwitter size={30} />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-700"
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp size={30} />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-900"
            aria-label="Share on LinkedIn"
          >
            <FaLinkedin size={30} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
