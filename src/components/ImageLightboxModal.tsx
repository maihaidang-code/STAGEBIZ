import React from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImageLightboxModalProps {
  imageUrl: string | null;
  altText?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ imageUrl, altText, onClose }) => {
  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      <div id="image-lightbox-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
        >
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10 bg-black/50 p-1.5 rounded-full backdrop-blur-md">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              title="Mở ảnh gốc"
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <img
            src={imageUrl}
            alt={altText || "Ảnh phóng to"}
            className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
