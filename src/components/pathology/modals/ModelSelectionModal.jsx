"use client";

import { X, Eye, CheckCircle, FileText } from "lucide-react";
import { useState } from "react";
import PreviewPanel from "./PreviewPanel";

import img2d from "../common/previews/2d.jpg";
import img3d from "../common/previews/3d.jpg";


const REPORT_MODELS = [
  {
    id: "2dreport",
    name: "2D Report",
    description: "Basic pathology report in 2D image with essential findings",
    previewImage: img2d,
    preview: {
      title: "Standard 2D Image Report",
      sections: ["Patient Information", "Clinical History", "Diagnosis"],
      layout: "2D"
    }
  },
  {
    id: "3dreport",
    name: "3D Report",
    description: "Comprehensive report with 3D detailed image analysis and recommendations",
    previewImage: img3d,
    preview: {
      title: "Detailed Pathology Analysis",
      sections: ["Patient Demographics", "Final Diagnosis", "Recommendations"],
      layout: "3D"
    }
  },
  {
    id: "model3",
    name: "Model 3",
    description: "model 3 info",
    previewImage: "model3.png",
    preview: {
      title: "Oncology Pathology Report",
      sections: ["Patient Data", "Treatment Recommendations"],
      layout: "model3"
    }
  },
  {
    id: "model4",
    name: "Model 4",
    description: "model 4 info",
    previewImage: "model3.png",
    preview: {
      title: "Minimal Pathology Report",
      sections: ["Patient ID","Diagnosis"],
      layout: "model4"
    }
  },
  {
    id: "model5",
    name: "Model 5",
    description: "Model 5 info",
    previewImage: "model5.png",
    preview: {
      title: "Research Pathology Documentation",
      sections: [],
      layout: "model5"
    }
  }
];


export default function ModelSelectionModal({
  show,
  onClose,
  selectedFile,
  selectedModel,
  onSelectModel,
  onConfirm,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#E6E8F0] dark:border-[#2A2A2A] flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-[#151515] dark:text-[#F9FAFB]">
              Select Report Model
            </h3>
            <p className="text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
              Choose how you want your pathology report to be formatted
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#8F94A3] dark:text-[#9CA3AF]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-[#E6E8F0] dark:border-[#2A2A2A]">
            <h4 className="font-semibold text-[#151515] dark:text-[#F9FAFB] mb-4">
              Available Models
            </h4>
            <div className="space-y-3">
              {REPORT_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => onSelectModel(model)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedModel?.id === model.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-[#E6E8F0] dark:border-[#2A2A2A] hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-[#151515] dark:text-[#F9FAFB] flex items-center">
                        {model.name}
                        {selectedModel?.id === model.id && (
                          <CheckCircle
                            size={16}
                            className="ml-2 text-blue-600 dark:text-blue-400"
                          />
                        )}
                      </h5>
                      <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
                        {model.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {selectedModel ? (
              <PreviewPanel model={selectedModel} />
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="text-[#8F94A3] dark:text-[#9CA3AF]">
                  <Eye size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Select a model to see preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E6E8F0] dark:border-[#2A2A2A] flex justify-between items-center">
          <div className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
            File: {selectedFile?.name}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#8F94A3] dark:text-[#9CA3AF] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
            >
              Back
            </button>
            <button
              onClick={onConfirm}  // This now goes to language selection
              disabled={!selectedModel}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedModel
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 dark:bg-[#2A2A2A] text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Language Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
