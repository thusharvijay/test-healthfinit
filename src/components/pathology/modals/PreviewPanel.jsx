"use client";

import { useState, useEffect } from "react";
import { Eye, FileText } from "lucide-react";

export default function PreviewPanel({ model }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [model]);

  return (
    <div className="bg-gray-50 dark:bg-[#262626] rounded-lg p-4 h-full overflow-auto">
      <h4 className="font-semibold text-[#151515] dark:text-[#F9FAFB] mb-4 flex items-center sticky top-0 bg-gray-50 dark:bg-[#262626] pb-2">
        <Eye size={18} className="mr-2" />
        Preview: {model.preview.title}
      </h4>

      <div className="space-y-4">
        {/* Report Preview Image */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-4 border">
          {!imageError ? (
            <div className="relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#2A2A2A] rounded">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <img
                src={model.previewImage}
                alt={`${model.name} preview`}
                className="w-full rounded border shadow-sm"
                style={{ height: "auto", objectFit: "contain" }}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 dark:bg-[#2A2A2A] rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mb-2">
                Preview image not available
              </p>
              <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                Expected: /public/previews/{model.previewImage}
              </p>
            </div>
          )}
        </div>

        {/* Report Details */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-4 border">
          <h5 className="font-medium text-[#151515] dark:text-[#F9FAFB] mb-3">
            Report Structure
          </h5>
          <div className="space-y-2">
            {model.preview.sections.map((section, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-50 dark:bg-[#262626] rounded"
              >
                <div className="w-1 h-1 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-[#151515] dark:text-[#F9FAFB]">
                  {section}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Layout Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center text-blue-700 dark:text-blue-300">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium">
              Layout: {model.preview.layout}
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-4">
            {model.description}
          </p>
        </div>
      </div>
    </div>
  );
}
