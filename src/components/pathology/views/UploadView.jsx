import { Upload, FileText, X, Eye, CheckCircle } from "lucide-react";
import { useState } from "react";
import ModelSelectionModal from "../modals/ModelSelectionModal";
import LanguageSelectionModal from "../modals/LanguageSelectionModal";


export function UploadView({
  handleFileUpload,
  uiPrefs,
  setUiPrefs,
  letterheadMeta,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [letterheadChoice, setLetterheadChoice] = useState("without");
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedModel(null); // Reset model selection when new file is chosen
    }
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setSelectedModel(null);
      }
    }
  };

  const handleProceedToModelSelection = () => {
    if (selectedFile) {
      setShowModelSelection(true);
    }
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const handleProceedToLanguageSelection = () => {
    if (selectedModel) {
      setShowModelSelection(false);
      setShowLanguageSelection(true);
    }
  };

  // Update handleLanguageSelect
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };


  const handleFinalUpload = () => {
    if (selectedFile && selectedModel && selectedLanguage) {
      handleFileUpload(
        selectedFile,
        letterheadChoice === "with" ? "With Letter Head" : "Without Letter Head",
        selectedModel,
        selectedLanguage
      );
      // Reset states
      setSelectedFile(null);
      setSelectedModel(null);
      setSelectedLanguage(null);
      setShowModelSelection(false);
      setShowLanguageSelection(false);
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setSelectedModel(null);
    setSelectedLanguage(null);
    setShowModelSelection(false);
    setShowLanguageSelection(false);
  };

  const PreviewPanel = ({ model }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

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
                  src={`/previews/${model.previewImage}`}
                  alt={`${model.name} preview`}
                  className="w-full rounded border shadow-sm"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              </div>
            ) : (
              // Fallback when image fails to load
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 dark:bg-[#2A2A2A] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mb-2">Preview image not available</p>
                <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                  Expected: /public/previews/{model.previewImage}
                </p>
              </div>
            )}
          </div>

          {/* Report Details */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-4 border">
            <h5 className="font-medium text-[#151515] dark:text-[#F9FAFB] mb-3">Report Structure</h5>
            <div className="space-y-2">
              {model.preview.sections.map((section, index) => (
                <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-[#262626] rounded">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-[#151515] dark:text-[#F9FAFB]">{section}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center text-blue-700 dark:text-blue-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium">Layout: {model.preview.layout}</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-4">
              {model.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB] mb-2">
          Upload Document
        </h2>
        <p className="text-[#8F94A3] dark:text-[#9CA3AF]">
          Upload your PDF pathology reports here (max 100MB)
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-6 lg:p-8">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-[#E6E8F0] dark:border-[#2A2A2A] hover:border-blue-300 dark:hover:border-blue-600"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            // File Selected State
            <div>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText
                  size={32}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-2">
                File Selected
              </h3>
              <p className="text-[#8F94A3] dark:text-[#9CA3AF] mb-1">
                {selectedFile.name}
              </p>
              <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mb-4">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={resetSelection}
                  className="px-4 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#8F94A3] dark:text-[#9CA3AF] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors duration-200"
                >
                  Choose Different File
                </button>
              </div>
            </div>
          ) : (
            // Upload State
            <div>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload
                  size={32}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-2">
                Upload PDF Document
              </h3>
              <p className="text-[#8F94A3] dark:text-[#9CA3AF] mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-full cursor-pointer transition-colors duration-200 font-medium"
              >
                <Upload size={18} strokeWidth={2} />
                <span>Browse Files</span>
              </label>
              <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF] mt-3">
                Only PDF files up to 100MB are supported
              </p>
            </div>
          )}
        </div>

        {selectedFile && (
          <>
            {/* Letterhead Selection */}
            <div className="mt-6">
              <h4 className="text-base font-semibold text-[#151515] dark:text-[#F9FAFB] mb-4">
                Letterhead Preference
              </h4>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] cursor-pointer transition-colors duration-200">
                  <input
                    type="radio"
                    name="letterhead"
                    value="without"
                    checked={letterheadChoice === "without"}
                    onChange={(e) => setLetterheadChoice(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB]">
                      Without Letter Head
                    </div>
                    <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                      Use the document as-is without any letterhead
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] cursor-pointer transition-colors duration-200">
                  <input
                    type="radio"
                    name="letterhead"
                    value="with"
                    checked={letterheadChoice === "with"}
                    onChange={(e) => setLetterheadChoice(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB]">
                      With Letter Head
                    </div>
                    <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                      {letterheadMeta?.hasLogo
                        ? "Use the uploaded lab letterhead"
                        : "Lab letterhead will be applied (upload in Settings first)"}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Continue to Model Selection Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleProceedToModelSelection}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Continue to Model Selection
              </button>
            </div>
          </>
        )}

        {/* Upload Guidelines */}
        <div className="mt-6 pt-6 border-t border-[#E6E8F0] dark:border-[#2A2A2A]">
          <h5 className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-3">
            Upload Guidelines:
          </h5>
          <ul className="text-xs text-[#8F94A3] dark:text-[#9CA3AF] space-y-1">
            <li>• Only PDF files are accepted</li>
            <li>• Maximum file size is 100MB</li>
            <li>• Ensure document quality is clear and readable</li>
            <li>• Admin uploads are automatically approved</li>
            <li>• Technician uploads require admin approval</li>
            <li>• Select appropriate report model for best results</li>
          </ul>
        </div>

        {/* Model Selection Modal*/}
        <ModelSelectionModal
          show={showModelSelection}
          onClose={() => setShowModelSelection(false)}
          selectedFile={selectedFile}
          selectedModel={selectedModel} 
          onSelectModel={handleModelSelect}
          onConfirm={handleProceedToLanguageSelection}
        />

        <LanguageSelectionModal
          show={showLanguageSelection}
          onClose={() => setShowLanguageSelection(false)}
          selectedFile={selectedFile}
          selectedModel={selectedModel}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={handleLanguageSelect}
          onConfirm={handleFinalUpload}
          onBack={() => {
            setShowLanguageSelection(false);
            setShowModelSelection(true);
          }}
        />
      </div>
    </div>
  );
}