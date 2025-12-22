"use client";

import { X, Globe, CheckCircle } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" }
];

export default function LanguageSelectionModal({
  show,
  onClose,
  selectedFile,
  selectedModel,
  selectedLanguage,
  onSelectLanguage,
  onConfirm,
  onBack
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#E6E8F0] dark:border-[#2A2A2A] flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-[#151515] dark:text-[#F9FAFB]">
              Select Report Language
            </h3>
            <p className="text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
              Choose the language for your pathology report
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
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LANGUAGES.map((language) => (
              <div
                key={language.code}
                onClick={() => onSelectLanguage(language)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedLanguage?.code === language.code
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-[#E6E8F0] dark:border-[#2A2A2A] hover:border-blue-300 dark:hover:border-blue-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe size={20} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <h5 className="font-medium text-[#151515] dark:text-[#F9FAFB]">
                        {language.name}
                      </h5>
                      <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                        {language.nativeName}
                      </p>
                    </div>
                  </div>
                  {selectedLanguage?.code === language.code && (
                    <CheckCircle
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Summary */}
          {selectedLanguage && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="font-medium text-[#151515] dark:text-[#F9FAFB] mb-2">
                Selection Summary
              </h5>
              <div className="space-y-1 text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                <p>Model: <span className="text-[#151515] dark:text-[#F9FAFB]">{selectedModel?.name}</span></p>
                <p>Language: <span className="text-[#151515] dark:text-[#F9FAFB]">{selectedLanguage.name} ({selectedLanguage.nativeName})</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E6E8F0] dark:border-[#2A2A2A] flex justify-between items-center">
          <div className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
            File: {selectedFile?.name}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#8F94A3] dark:text-[#9CA3AF] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
            >
              Back to Model
            </button>
            <button
              onClick={onConfirm}
              disabled={!selectedLanguage}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedLanguage
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 dark:bg-[#2A2A2A] text-gray-500 cursor-not-allowed"
              }`}
            >
              Upload Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}