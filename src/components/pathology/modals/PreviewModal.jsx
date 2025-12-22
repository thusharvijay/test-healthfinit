import { X, Download } from "lucide-react";

export function PreviewModal({ show, onClose, name, url }) {
  if (!show) return null;

  const handleDownload = () => {
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="inline-block align-bottom bg-white dark:bg-[#1E1E1E] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
                {name}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg hover:bg-[#F6F7F9] dark:hover:bg-[#262626] transition-all duration-150"
                  title="Download document"
                >
                  <Download size={20} className="text-[#525A6B] dark:text-[#9CA3AF]" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[#F6F7F9] dark:hover:bg-[#262626] transition-all duration-150"
                >
                  <X size={20} className="text-[#525A6B] dark:text-[#9CA3AF]" />
                </button>
              </div>
            </div>
            <div className="border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg overflow-hidden">
              {url ? (
                <iframe
                  src={url}
                  className="w-full h-96"
                  title={name}
                  style={{ minHeight: '600px' }}
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-[#8F94A3] dark:text-[#9CA3AF]">
                    Preview not available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}