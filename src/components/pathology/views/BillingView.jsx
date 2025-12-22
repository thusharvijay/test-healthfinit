import { Receipt, FileDown, Printer, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { useState } from "react";

export function BillingView({ billing, onExportBilling, onExportDocs, onGenerateInvoice }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const totalBilled = billing.reduce((sum, bill) => sum + bill.charge, 0);
  const thisMonthBilling = billing.filter(bill => {
    const billDate = new Date(bill.time);
    const [year, month] = selectedMonth.split('-');
    return billDate.getFullYear() === parseInt(year) && billDate.getMonth() === parseInt(month) - 1;
  });
  const thisMonthTotal = thisMonthBilling.reduce((sum, bill) => sum + bill.charge, 0);

  const handleGenerateInvoice = () => {
    // Pass full date object instead of just month string
    const [year, month] = selectedMonth.split('-');
    const invoiceDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    onGenerateInvoice(invoiceDate);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB] mb-2">
          Billing & Invoices
        </h2>
        <p className="text-[#8F94A3] dark:text-[#9CA3AF]">
          View billing history, export data, and generate invoices
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">Total Billed</h3>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB]">
            ₹{totalBilled}
          </div>
          <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
            All time earnings
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">This Month</h3>
            <Calendar size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB]">
            ₹{thisMonthTotal}
          </div>
          <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
            {thisMonthBilling.length} transactions
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">Transactions</h3>
            <Receipt size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB]">
            {billing.length}
          </div>
          <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
            Total processed
          </p>
        </div>
      </div>

      {/* Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Export Data */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-4">
            Export Data
          </h3>
          <div className="space-y-3">
            <button
              onClick={onExportBilling}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <FileDown size={18} />
              <span>Export Billing CSV</span>
            </button>
            <button
              onClick={onExportDocs}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#151515] dark:text-[#F9FAFB] hover:bg-gray-50 dark:hover:bg-[#262626] rounded-lg transition-colors duration-200"
            >
              <FileDown size={18} />
              <span>Export Documents CSV</span>
            </button>
          </div>
        </div>

        {/* Generate Invoice */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-4">
            Generate Invoice
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF] mb-2">
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleGenerateInvoice}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              <Printer size={18} />
              <span>Generate GST Invoice</span>
            </button>
            <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
              Includes 18% GST (9% CGST + 9% SGST)
            </p>
          </div>
        </div>
      </div>

      {/* Billing History Table */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-[#E6E8F0] dark:border-[#2A2A2A]">
          <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
            Recent Transactions
          </h3>
          <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
            All billing activity for your account
          </p>
        </div>

        {billing.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-[#151515] dark:text-[#F9FAFB] mb-2">
              No billing history
            </h3>
            <p className="text-[#8F94A3] dark:text-[#9CA3AF]">
              Your billing transactions will appear here after uploading documents
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#F6F8FA] dark:bg-[#262626]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    Balance After
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8F0] dark:divide-[#2A2A2A]">
                {billing.map((bill, index) => (
                  <tr key={index} className="hover:bg-[#F7F9FC] dark:hover:bg-[#262626] transition-colors duration-200">
                    <td className="px-4 py-3 text-sm text-[#151515] dark:text-[#F9FAFB]">
                      {formatDate(bill.time)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Receipt size={16} className="text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB] truncate max-w-48">
                            {bill.fileName}
                          </div>
                          <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                            ID: {bill.docId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        bill.mode === 'Trial'
                          ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                          : 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        {bill.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#151515] dark:text-[#F9FAFB]">
                      {bill.charge === 0 ? 'Free' : `₹${bill.charge}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6E7380] dark:text-[#9CA3AF]">
                      ₹{bill.balanceAfter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Billing Info */}
      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
          💡 Billing Information
        </h3>
        <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
          <li>• All transactions are recorded in Indian Rupees (₹)</li>
          <li>• GST invoices include 18% tax (9% CGST + 9% SGST)</li>
          <li>• Trial uploads are processed free of charge</li>
          <li>• Billing history can be exported as CSV for record keeping</li>
          <li>• Monthly invoices can be generated for accounting purposes</li>
        </ul>
      </div>
    </div>
  );
}