"use client";

import { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  RotateCcw
} from 'lucide-react';

function ProcessingStatus({ reportId, docStatus }) {
  const [status, setStatus] = useState({ ready: false, checking: true });
  const [shouldCheck, setShouldCheck] = useState(false);

  useEffect(() => {
    // Don't check if not approved yet
    if (docStatus !== 'Approved') {
      setStatus({ ready: false, checking: false, status: 'pending_approval' });
      return;
    }

    // ✅ When docStatus changes to 'Approved', trigger immediate check
    setShouldCheck(true);

    let mounted = true;
    let pollInterval;

    const checkStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, checking: true })); // Show checking immediately
        const { apiService } = await import('../services/api');
        const result = await apiService.getReportProcessingStatus(reportId);
        if (mounted) {
          setStatus({ ...result, checking: false });

          if (result.ready && pollInterval) {
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        if (mounted) {
          setStatus({ ready: false, checking: false });
        }
      }
    };

    // ✅ Immediate check when approved
    checkStatus();

    // ✅ Start polling
    pollInterval = setInterval(() => {
      if (mounted && !status.ready) {
        checkStatus();
      }
    }, 60000);

    return () => {
      mounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [reportId, docStatus]); // ✅ Re-run when docStatus changes

  // Show waiting for approval
  if (status.status === 'pending_approval') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400">
        Awaiting Approval
      </span>
    );
  }

  if (status.checking) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
        <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1"></div>
        Checking...
      </span>
    );
  }

  return status.ready ? (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
      ✓ Processed
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400">
      <div className="w-3 h-3 border-2 border-yellow-400 border-t-yellow-600 rounded-full animate-spin mr-1"></div>
      Processing...
    </span>
  );
}

export function DocumentsView({
  docs,
  uiPrefs,
  setUiPrefs,
  userRole,
  onPreview,
  onDelete,
  onApprove,
  saveLS,
  LS_KEYS,
  currentUser,
  loading
}) {
  const [filteredDocs, setFilteredDocs] = useState(docs);

  // Filter documents based on search and filters
  const handleFilterChange = (key, value) => {
    const newPrefs = { ...uiPrefs, [key]: value };
    setUiPrefs(newPrefs);
    saveLS(LS_KEYS.UI(currentUser), newPrefs);

    // Apply filters
    let filtered = docs;

    // Search filter
    if (newPrefs.search) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(newPrefs.search.toLowerCase())
      );
    }

    // Status filter
    if (newPrefs.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === newPrefs.status);
    }

    // Letterhead filter
    if (newPrefs.head !== 'all') {
      if (newPrefs.head === 'with') {
        filtered = filtered.filter(doc => doc.head === 'With Letter Head');
      } else if (newPrefs.head === 'without') {
        filtered = filtered.filter(doc => doc.head === 'Without Letter Head');
      }
    }

    // Date filter
    if (newPrefs.date !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.dateISO);
        const docDateOnly = new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate());

        switch (newPrefs.date) {
          case 'today':
            return docDateOnly.getTime() === today.getTime();
          case 'last7':
            const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return docDateOnly >= sevenDaysAgo;
          case 'last30':
            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return docDateOnly >= thirtyDaysAgo;
          default:
            return true;
        }
      });
    }

    setFilteredDocs(filtered);
  };

  const resetFilters = () => {
    const resetPrefs = {
      search: '',
      head: 'all',
      date: 'all',
      status: 'all',
      letterhead: uiPrefs.letterhead,
      prompt: uiPrefs.prompt
    };
    setUiPrefs(resetPrefs);
    saveLS(LS_KEYS.UI(currentUser), resetPrefs);
    setFilteredDocs(docs);
  };

  const handleDownload = async (doc) => {
    try {
      const { apiService } = await import('../services/api');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

      // Check processing status
      const status = await apiService.getReportProcessingStatus(doc.id);
      if (!status.ready) {
        const shouldDownloadOriginal = window.confirm(
          'The processed health summary is still being generated. ' +
          'Would you like to download the original report instead?'
        );
        if (!shouldDownloadOriginal) return;

        const originalUrl = doc.fileUrl || doc.file_url;
        if (originalUrl) {
          // Fetch and download as blob for Cloudinary URLs
          if (originalUrl.includes('cloudinary')) {
            try {
              const response = await fetch(originalUrl);
              if (!response.ok) throw new Error('Failed to fetch original file');
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = doc.name || 'document.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(blobUrl);
            } catch (err) {
              console.error("Blob download failed:", err);
              // Fallback to direct download
              window.location.href = originalUrl;
            }
          } else {
            // For local URLs, direct download
            window.location.href = originalUrl;
          }
        } else {
          alert('Original file URL not found');
        }
        return;
      }

      // Get the JSON with download_url
      const downloadInfo = await apiService.downloadReport(doc.id);
      if (!downloadInfo.download_url) {
        alert(downloadInfo.message || 'Report is still being processed.');
        return;
      }

      // Download from local output_pdf folder or Cloudinary
      let downloadUrl = downloadInfo.download_url;
      
      // Convert relative URLs to full URLs
      if (downloadUrl.startsWith('/')) {
        downloadUrl = `${API_BASE_URL}${downloadUrl}`;
      }
      
      // Always fetch as blob to ensure download instead of view
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `health_summary_${doc.name}` || 'health_summary.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the blob URL after a short delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } catch (err) {
        console.error("Download failed:", err);
        alert(`Failed to download file: ${err.message}`);
      }

    } catch (err) {
      console.error("Download failed:", err);
      alert(`Failed to download document: ${err.message}`);
    }
  };




  // Initialize filtered docs on first render
  useEffect(() => {
    handleFilterChange('search', uiPrefs.search);
  }, [docs, uiPrefs]);

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB] mb-2">
          Documents
        </h2>
        <p className="text-[#8F94A3] dark:text-[#9CA3AF]">
          Manage your uploaded pathology reports
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-4 lg:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F94A3] dark:text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search documents..."
                value={uiPrefs.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={uiPrefs.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Letterhead Filter */}
          <div className="lg:w-48">
            <select
              value={uiPrefs.head}
              onChange={(e) => handleFilterChange('head', e.target.value)}
              className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Letterheads</option>
              <option value="with">With Letter Head</option>
              <option value="without">Without Letter Head</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="lg:w-48">
            <select
              value={uiPrefs.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="flex items-center justify-center px-4 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg text-[#8F94A3] dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors duration-200"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset
          </button>
        </div>

        <div className="mt-4 text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
          Showing {filteredDocs.length} of {docs.length} documents
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-[#8F94A3] dark:text-[#9CA3AF]">Loading...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-[#151515] dark:text-[#F9FAFB] mb-2">
              No documents found
            </h3>
            <p className="text-[#8F94A3] dark:text-[#9CA3AF]">
              {docs.length === 0
                ? "Upload your first document to get started"
                : "Try adjusting your filters"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#F6F8FA] dark:bg-[#262626]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    File
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Uploaded
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Letter Head
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Uploaded By
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Processing
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8F0] dark:divide-[#2A2A2A]">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F7F9FC] dark:hover:bg-[#262626] transition-colors duration-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center">
                          <FileText size={16} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB] truncate max-w-xs">
                            {doc.name}
                          </div>
                          <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                            ID: {doc.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#151515] dark:text-[#F9FAFB]">
                      {(doc.size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6E7380] dark:text-[#9CA3AF]">
                      {new Date(doc.dateISO).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#151515] dark:text-[#F9FAFB]">
                      {doc.head || 'Without Letter Head'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'Approved'
                        ? 'text-[#22A447] dark:text-[#4ADE80] bg-[#E8F8EE] dark:bg-[#1A4A2E] border border-[#BFE6CE] dark:border-[#2E7D32]'
                        : 'text-[#F2994A] dark:text-[#FB923C] bg-[#FFF3E6] dark:bg-[#4A3428] border border-[#FAD7B9] dark:border-[#8B4513]'
                        }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="text-[#151515] dark:text-[#F9FAFB] font-medium">
                          {doc.uploader_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                          {doc.uploader_role || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ProcessingStatus reportId={doc.id} docStatus={doc.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {/* Preview Button */}
                        <button
                          onClick={async () => {
                            try {
                              const { apiService } = await import('../services/api');
                              const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                              let urlToUse = null;

                              // Check if processed version exists
                              const status = await apiService.getReportProcessingStatus(doc.id);

                              if (status.ready) {
                                // Get processed version
                                const downloadInfo = await apiService.downloadReport(doc.id);
                                if (downloadInfo.download_url) {
                                  urlToUse = downloadInfo.download_url;
                                }
                              }

                              // Fall back to original if no processed url
                              if (!urlToUse) {
                                urlToUse = doc.fileUrl || doc.file_url;
                              }

                              if (urlToUse) {
                                // Convert relative URLs to full URLs
                                if (urlToUse.startsWith('/')) {
                                  urlToUse = `${API_BASE_URL}${urlToUse}`;
                                }

                                // For local PDF files, open directly
                                if (urlToUse.includes('/download-pdf-file/')) {
                                  window.open(urlToUse, '_blank');
                                  return;
                                }

                                try {
                                  // For Cloudinary URLs, fetch as blob
                                  const response = await fetch(urlToUse, { cache: 'no-store' });

                                  if (!response.ok) {
                                    throw new Error(`Failed to fetch: ${response.status}`);
                                  }

                                  const blob = await response.blob();
                                  // Force PDF type to ensure browser renders it
                                  const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                                  const blobUrl = URL.createObjectURL(pdfBlob);
                                  onPreview(doc.name, blobUrl);
                                } catch (fetchErr) {
                                  console.error("Failed to fetch blob for preview:", fetchErr);
                                  // Fallback: try opening in new tab
                                  window.open(urlToUse, '_blank');
                                }
                              } else {
                                alert("No file available for preview.");
                              }
                            } catch (err) {
                              console.error('Preview failed:', err);
                              alert("An error occurred while trying to preview: " + err.message);
                            }
                          }}
                          className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group"
                          title="Preview document"
                        >
                          <Eye size={16} className="text-[#525A6B] group-hover:text-[#1F2937] dark:text-[#9CA3AF] dark:group-hover:text-[#E5E7EB] transition-colors duration-200" />
                        </button>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group"
                          title="Download document"
                        >
                          <Download
                            size={16}
                            className="text-[#525A6B] group-hover:text-[#1F2937] dark:text-[#9CA3AF] dark:group-hover:text-[#E5E7EB] transition-colors duration-200"
                          />
                        </button>

                        {/* Approve Button (Admin only, for Pending docs) */}
                        {userRole === 'Admin' && doc.status === 'Pending' && (
                          <button
                            onClick={() => onApprove(doc.id)}
                            className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group"
                            title="Approve and charge"
                          >
                            <CheckCircle
                              size={16}
                              className="text-green-600 group-hover:text-green-700 dark:text-green-400 dark:group-hover:text-green-300 transition-colors duration-200"
                            />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            const confirmDelete = window.confirm(`Are you sure you want to delete "${doc.name}"?`);
                            if (confirmDelete) {
                              onDelete(doc.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-[#3B0D0D] transition-all duration-200 group"
                          title="Delete document"
                        >
                          <Trash2
                            size={16}
                            className="text-red-600 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300 transition-colors duration-200"
                          />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}