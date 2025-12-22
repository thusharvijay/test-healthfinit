import {
  Activity,
  LayoutDashboard,
  FileText,
  Upload,
  Wallet,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Technician"] },
    { id: "documents", label: "Documents", icon: FileText, roles: ["Admin", "Technician"] },
    { id: "upload", label: "Upload", icon: Upload, roles: ["Admin", "Technician"] },
    { id: "wallet", label: "Wallet", icon: Wallet, roles: ["Admin"] }, 
    { id: "billing", label: "Billing", icon: Receipt, roles: ["Admin"] }, 
    { id: "settings", label: "Settings", icon: Settings, roles: ["Admin"] }, 
];

function SidebarNav({ currentView, setCurrentView, onLinkClick, userRole }) {
    return (
        <nav className="space-y-2">
            {menuItems
                .filter(item => item.roles.includes(userRole))
                .map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={item.id}
                            data-tour={`${item.id}-nav`}  // ✅ ADD THIS LINE
                            onClick={() => {
                                setCurrentView(item.id);
                                if (onLinkClick) onLinkClick();
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-150 ${
                                currentView === item.id
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-[#374151] dark:text-[#9CA3AF] hover:bg-[#F6F8FB] dark:hover:bg-[#262626]"
                            }`}
                        >
                            <IconComponent size={20} strokeWidth={1.6} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    );
                })}
        </nav>
    );
}

function UserProfile({ userData, userRole, onLogout }) {
    return (
        <div className="mt-8 pt-4 border-t border-[#E6E8F0] dark:border-[#2A2A2A]">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-[#262626] rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <User
                        size={20}
                        className="text-blue-600 dark:text-blue-400"
                    />
                </div>
                <div>
                    <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB]">
                        {userData?.owner_name || userData?.name || userData?.owner || "User"}
                    </div>
                    <div className="text-xs text-[#6E7380] dark:text-[#9CA3AF]">
                        {userRole}
                    </div>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 mt-2 rounded-lg text-left transition-all duration-150 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
                <LogOut size={20} strokeWidth={1.6} />
                <span className="text-sm font-medium">Logout</span>
            </button>
        </div>
    );
}


export function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen, currentView, setCurrentView, userData, userRole, onLogout }) {
    const mobileSidebarContent = (
        <>
            <div className="flex items-center justify-between p-4 border-b border-[#E6E8F0] dark:border-[#2A2A2A]">
                <div className="flex items-center space-x-2">
                    <Activity
                        size={24}
                        strokeWidth={1.6}
                        className="rotate-45 text-blue-600"
                    />
                    <span className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
                        Pathology Pro
                    </span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-[#F6F7F9] dark:hover:bg-[#262626] transition-all duration-150"
                >
                    <X size={20} className="text-[#525A6B] dark:text-[#9CA3AF]" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <SidebarNav currentView={currentView} setCurrentView={setCurrentView} onLinkClick={() => setIsMobileMenuOpen(false)} userRole={userRole} />
                <UserProfile userData={userData} userRole={userRole} onLogout={onLogout}  />
            </div>
        </>
    );

    const desktopSidebarContent = (
        <>
            <div className="flex items-center space-x-3 p-6 border-b border-[#E6E8F0] dark:border-[#2A2A2A]">
                <Activity
                    size={32}
                    strokeWidth={1.6}
                    className="rotate-45 text-blue-600"
                />
                <div>
                    <h1 className="text-xl font-bold text-[#151515] dark:text-[#F9FAFB]">
                        Pathology Pro
                    </h1>
                    <p className="text-sm text-[#6E7380] dark:text-[#9CA3AF]">
                        Lab Management
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                 <SidebarNav currentView={currentView} setCurrentView={setCurrentView} userRole={userRole} />
            </div>

            <div className="p-4 border-t border-[#E6E8F0] dark:border-[#2A2A2A]">
                <UserProfile userData={userData} userRole={userRole} onLogout={onLogout} />
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div data-tour="sidebar" className="relative flex flex-col w-80 max-w-xs bg-white dark:bg-[#1E1E1E] shadow-xl">
                        {mobileSidebarContent}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0 lg:w-64">
                <div data-tour="sidebar" className="flex flex-col w-full bg-white dark:bg-[#1E1E1E] border-r border-[#E6E8F0] dark:border-[#2A2A2A]">
                    {desktopSidebarContent}
                </div>
            </div>
        </>
    );
}
