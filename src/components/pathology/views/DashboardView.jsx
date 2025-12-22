// Importing icons from lucide-react
import {
  Clock,
  FileText,
  Wallet,
  CheckCircle,
  Receipt,
} from "lucide-react";


// Reusable card for showing statistics on dashboard
function StatCard({ icon: Icon, title, value, footer, onAction, actionText, iconColorClass }) {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                    {title}
                </h3>
                <Icon size={16} className={iconColorClass} />
            </div>
            <div className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB]">
                {value}
            </div>
            {onAction ? (
                <button
                    onClick={onAction}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                >
                    {actionText}
                </button>
            ) : (
                <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
                    {footer}
                </p>
            )}
        </div>
    );
}

// Component showing recent uploaded documents
function RecentDocuments({ docs, setCurrentView }) {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#151515] dark:text-[#F9FAFB]">
                    Recent Documents
                </h3>
                <button
                    onClick={() => setCurrentView("documents")}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View all
                </button>
            </div>
            <div className="space-y-3">
                {docs.slice(0, 5).map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg"
                    >
                        <div className="flex items-center space-x-3">
                            <FileText size={16} className="text-blue-500" />
                            <div>
                                <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB] truncate max-w-48">
                                    {doc.name}
                                </div>
                                <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                                    {new Date(doc.dateISO).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <span
                            className={`px-2 py-1 text-xs rounded-full ${doc.status === "Approved"
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                    : "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                }`}
                        >
                            {doc.status}
                        </span>
                    </div>
                ))}
                {docs.length === 0 && (
                    <div className="text-center py-8">
                        <FileText
                            size={48}
                            className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                        />
                        <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                            No documents uploaded yet
                        </p>
                        <button
                            onClick={() => setCurrentView("upload")}
                            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Upload your first document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Component showing recent billing history
function RecentBilling({ billing, setCurrentView }) {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#151515] dark:text-[#F9FAFB]">
                    Recent Billing
                </h3>
                <button
                    onClick={() => setCurrentView("billing")}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View all
                </button>
            </div>
            <div className="space-y-3">
                {billing.slice(0, 5).map((bill, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg"
                    >
                        <div className="flex items-center space-x-3">
                            <Receipt size={16} className="text-purple-500" />
                            <div>
                                <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB] truncate max-w-48">
                                    {bill.fileName}
                                </div>
                                <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                                    {new Date(bill.time).toLocaleDateString()} • {bill.mode}
                                    {bill.uploaderRole && ` • ${bill.uploaderRole}`}
                                </div>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB]">
                            🪙{bill.charge}
                        </span>
                    </div>
                ))}
                {billing.length === 0 && (
                    <div className="text-center py-8">
                        <Receipt
                            size={48}
                            className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                        />
                        <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                            No billing activity yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main Dashboard view combining all components
export function DashboardView({
    trial,
    docs,
    wallet,
    billing,
    setShowWalletModal,
    setCurrentView,
    userRole
}) {
    return (
        <div className="p-4 lg:p-8">
        {userRole === "Admin" ? (
            // ✅ Admin sees all 4 cards
            <div data-tour="stats-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard
                    icon={Clock}
                    title="Trial Cases Left"
                    value={trial.left}
                    footer="Out of 7 free cases"
                    iconColorClass="text-blue-500"
                />
                <StatCard
                    icon={FileText}
                    title="Cases Uploaded"
                    value={docs.length}
                    footer="Total documents"
                    iconColorClass="text-green-500"
                />
                <StatCard
                    icon={Wallet}
                    title="Wallet Balance"
                    value={`🪙${wallet}`}
                    actionText="Add Coins"
                    onAction={() => setShowWalletModal(true)}
                    iconColorClass="text-purple-500"
                />
                <StatCard
                    icon={CheckCircle}
                    title="Plan Status"
                    value={trial.left > 0 ? "Trial" : "Pro"}
                    footer={trial.left > 0 ? "Free trial active" : "Pay per case"}
                    iconColorClass="text-orange-500"
                />
            </div>
        ) : (
            // ✅ Technician sees only 2 card
            <div data-tour="stats-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard
                    icon={Clock}
                    title="Trial Cases Left"
                    value={trial.left}
                    footer="Out of 7 free cases"
                    iconColorClass="text-blue-500"
                />
                <StatCard
                    icon={FileText}
                    title="Cases Uploaded"
                    value={docs.length}
                    footer="Total documents"
                    iconColorClass="text-green-500"
                />
            </div>
        )}
        
        {/* Rest of the dashboard remains the same for both roles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentDocuments docs={docs} setCurrentView={setCurrentView} />
            <RecentBilling billing={billing} setCurrentView={setCurrentView} />
        </div>
    </div>
    );
}
