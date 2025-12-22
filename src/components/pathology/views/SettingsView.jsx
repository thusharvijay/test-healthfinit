import { 
  Settings, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  Mail, 
  Calendar,
  Search,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  Save,
  X,
  Building,
  AlertTriangle,
  Upload,
  Download,
} from "lucide-react";
import { useState, forwardRef, useImperativeHandle } from "react";
import { BranchManagement } from '../modals/BranchManagement';
import { SessionsView } from './SessionsView';

const STATES = [
  "", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", 
  "Puducherry", "Others"
];

export const SettingsView = forwardRef(({ 
  userRole, 
  users, 
  branches,
  onAddUser, 
  onUpdateUser, 
  onDeleteUser, 
  onToggleUserStatus,
  onAddBranch, 
  onUpdateBranch,  
  onDeleteBranch,
  onRefreshUsers,
  letterheadMeta,
  onUploadLetterhead,
  onDownloadLetterhead,
  loading,
  sessions, 
  sessionStats, 
  onRefreshSessions,
  onDeleteSession
}, ref) => {
  // -------------------------
  // Users state (detailed)
  // -------------------------
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'Technician',
    name: '',
    password: '',
    phone: '',
    state: '',
    branch_id: ''
  });
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    openEditModal: (userId, passwordResetRequestId) => {
      const user = users.find(u => u.id === userId);
      if (user) {
        handleEditUser(user, passwordResetRequestId);
      }
    }
  }));

  // Filter users based on search
  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.state || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => /^\d{10}$/.test(String(phone || '').trim());

  const handleAddUser = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newUser.email) newErrors.email = 'Email is required';
    else if (!validateEmail(newUser.email)) newErrors.email = 'Invalid email';
    if (!newUser.name) newErrors.name = 'Name is required';
    if (!newUser.password) newErrors.password = 'Password is required';
    else if (newUser.password.length < 6) newErrors.password = 'Min 6 characters';
    if (!newUser.branch_id) newErrors.branch_id = 'Select a branch';
    if (!newUser.phone) newErrors.phone = 'Phone required';
    else if (!validatePhone(newUser.phone)) newErrors.phone = 'Phone must be exactly 10 digits';
    if (!newUser.state) newErrors.state = 'State required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onAddUser(newUser);
      setNewUser({ email: '', role: 'Technician', name: '', password: '', phone: '', state: '', branch_id: '' });
      setShowAddUserModal(false);
      setErrors({});
    }
  };

  const handleEditUser = (user, passwordResetRequestId = null) => {
    setEditingUser({ 
      ...user,
      passwordResetRequestId,
      newPassword: ''
    });
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!editingUser.email) newErrors.email = 'Email is required';
    else if (!validateEmail(editingUser.email)) newErrors.email = 'Invalid email';
    if (!editingUser.name) newErrors.name = 'Name is required';
    if (!editingUser.phone) newErrors.phone = 'Phone required';
    else if (!validatePhone(editingUser.phone)) newErrors.phone = 'Phone must be exactly 10 digits';
    if (!editingUser.state) newErrors.state = 'State required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onUpdateUser(editingUser.id, editingUser);
      setEditingUser(null);
      setErrors({});
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setErrors({});
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadLetterhead(file);
    }
    // Reset file input
    e.target.value = null;
  };


  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB] mb-2">
          Settings
        </h2>
        <p className="text-[#8F94A3] dark:text-[#9CA3AF]">
          Manage users, letterhead, and lab configuration
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg mb-6">
        <div className="border-b border-[#E6E8F0] dark:border-[#2A2A2A]">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-[#8F94A3] dark:text-[#9CA3AF] hover:text-[#151515] dark:hover:text-[#F9FAFB]'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              User Management
            </button>

            <button
              onClick={() => setActiveTab('branches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'branches'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-[#8F94A3] dark:text-[#9CA3AF] hover:text-[#151515] dark:hover:text-[#F9FAFB]'
              }`}
            >
              <Building size={16} className="inline mr-2" />
              Branches
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-[#8F94A3] dark:text-[#9CA3AF] hover:text-[#151515] dark:hover:text-[#F9FAFB]'
              }`}
            >
              <Building size={16} className="inline mr-2" />
              Sessions
            </button>

            <button
              onClick={() => setActiveTab('letterhead')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'letterhead'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-[#8F94A3] dark:text-[#9CA3AF] hover:text-[#151515] dark:hover:text-[#F9FAFB]'
              }`}
            >
              <Building size={16} className="inline mr-2" />
              Letterhead
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* ---------------- USERS TAB (updated/detailed) ---------------- */}
          {activeTab === 'users' && (
            <div>
              {/* Users Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-1">
                    User Management
                  </h3>
                  <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                    Add, edit, or remove user accounts for your lab
                  </p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="mt-4 lg:mt-0 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus size={16} className="mr-2" />
                  Add User
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F94A3] dark:text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-[#8F94A3] dark:text-[#9CA3AF]">Loading...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h4 className="text-lg font-medium text-[#151515] dark:text-[#F9FAFB] mb-2">
                      No users found
                    </h4>
                    <p className="text-[#8F94A3] dark:text-[#9CA3AF] mb-4">
                      {users?.length === 0 ? "Add your first user to get started" : "Try adjusting your search"}
                    </p>
                    {users?.length === 0 && (
                      <button
                        onClick={() => setShowAddUserModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        Add First User
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-[#F6F8FA] dark:bg-[#262626]">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                            Added
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E8F0] dark:divide-[#2A2A2A]">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-[#F7F9FC] dark:hover:bg-[#262626] transition-colors duration-200">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB]">
                                    {user.name || user.email.split('@')[0]}
                                  </div>
                                  <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                                    {user.email}
                                  </div>
                                  {/* ✅ ADD BRANCH INFO */}
                                  {user.branch_id && branches.find(b => b.id === user.branch_id) && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                                      <Building size={10} className="mr-1" />
                                      {branches.find(b => b.id === user.branch_id).branch_name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'Admin'
                                  ? 'text-[#DC2626] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#4A1D1F] border border-[#FECACA] dark:border-[#7F1D1D]'
                                  : 'text-[#2563EB] dark:text-[#60A5FA] bg-[#EFF6FF] dark:bg-[#1E3A8A] border border-[#DBEAFE] dark:border-[#1D4ED8]'
                              }`}>
                                {user.role === 'Admin' ? <ShieldCheck size={12} className="mr-1" /> : <Shield size={12} className="mr-1" />}
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'Active'
                                  ? 'text-[#22A447] dark:text-[#4ADE80] bg-[#E8F8EE] dark:bg-[#1A4A2E] border border-[#BFE6CE] dark:border-[#2E7D32]'
                                  : 'text-[#6B7280] dark:text-[#9CA3AF] bg-[#F3F4F6] dark:bg-[#374151] border border-[#D1D5DB] dark:border-[#4B5563]'
                              }`}>
                                {user.status === 'Active' ? <Eye size={12} className="mr-1" /> : <EyeOff size={12} className="mr-1" />}
                                {user.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#6E7380] dark:text-[#9CA3AF]">
                              {user.dateAdded ? new Date(user.dateAdded).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group"
                                  title="Edit user"
                                >
                                  <Edit3 
                                    size={16} 
                                    className="text-[#525A6B] group-hover:text-[#1F2937] dark:text-[#9CA3AF] dark:group-hover:text-[#E5E7EB] transition-colors duration-200" 
                                  />
                                </button>

                                <button
                                  onClick={() => onToggleUserStatus(user.id)}
                                  className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group"
                                  title={user.status === 'Active' ? 'Disable user' : 'Enable user'}
                                >
                                  {user.status === 'Active' ? (
                                    <UserMinus 
                                      size={16} 
                                      className="text-orange-500 group-hover:text-orange-600 dark:text-orange-400 dark:group-hover:text-orange-300 transition-colors duration-200" 
                                    />
                                  ) : (
                                    <UserPlus 
                                      size={16} 
                                      className="text-green-600 group-hover:text-green-700 dark:text-green-400 dark:group-hover:text-green-300 transition-colors duration-200" 
                                    />
                                  )}
                                </button>

                                <button
                                  onClick={() => onDeleteUser(user.id)}
                                  className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group"
                                  title="Delete user"
                                >
                                  <Trash2 
                                    size={16} 
                                    className="text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300 transition-colors duration-200" 
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
          )}

          {/* ---------------- BRANCHES TAB (kept intact) ---------------- */}
          {activeTab === 'branches' && (
            <BranchManagement 
              branches={branches}
              onAddBranch={onAddBranch}
              onUpdateBranch={onUpdateBranch}
              onDeleteBranch={onDeleteBranch}
              onRefreshUsers={onRefreshUsers}
              loading={loading}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsView
              sessions={sessions}
              sessionStats={sessionStats}
              onRefresh={onRefreshSessions}
              onDeleteSession={onDeleteSession}
              loading={loading}
            />
          )}

          {/* ---------------- LETTERHEAD TAB (unchanged) ---------------- */}
          {activeTab === 'letterhead' && (
            <div>
              <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-1">
                Lab Letterhead
              </h3>
              <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mb-6">
                Upload your lab's letterhead to be used with documents
              </p>

              <div className="space-y-6">
                {/* Current Letterhead Status */}
                <div className="bg-gray-50 dark:bg-[#262626] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-[#151515] dark:text-[#F9FAFB]">
                      Current Status
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      letterheadMeta?.hasLogo
                        ? 'text-[#22A447] dark:text-[#4ADE80] bg-[#E8F8EE] dark:bg-[#1A4A2E] border border-[#BFE6CE] dark:border-[#2E7D32]'
                        : 'text-[#F2994A] dark:text-[#FB923C] bg-[#FFF3E6] dark:bg-[#4A3428] border border-[#FAD7B9] dark:border-[#8B4513]'
                    }`}>
                      {letterheadMeta?.hasLogo ? 'Configured' : 'Not Set'}
                    </span>
                  </div>
                  
                  {letterheadMeta?.hasLogo ? (
                    <div>
                      <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mb-3">
                        Letterhead is configured and ready to use with document uploads.
                      </p>
                      {letterheadMeta.fileName && (
                        <p className="text-xs text-[#8F94A3] dark:text-[#9CA3AF] mb-3">
                          File: {letterheadMeta.fileName}
                        </p>
                      )} 
                      <div className="flex space-x-3">
                        {onDownloadLetterhead && (
                          <button
                            onClick={onDownloadLetterhead}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm"
                          >
                            <Download size={16} className="mr-2" />
                            Download Current
                          </button>
                        )}
                        <label className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm cursor-pointer">
                          <Upload size={16} className="mr-2" />
                          Replace Letterhead
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mb-4">
                        No letterhead has been uploaded. Upload one to use with document processing.
                      </p>
                      <label className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm cursor-pointer w-fit">
                        <Upload size={16} className="mr-2" />
                        Upload Letterhead
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Upload Guidelines */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                    Upload Guidelines:
                  </h5>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Supported formats: JPG, PNG, PDF</li>
                    <li>• Recommended size: 1200x800 pixels or larger</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• High resolution images work best for document overlay</li>
                    <li>• The letterhead will be applied to documents marked "With Letter Head"</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Add User Modal (detailed) ---------------- */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
                Add New User
              </h3>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setNewUser({ email: '', role: 'Technician', name: '', phone: '', state: ''});
                  setErrors({});
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#374151] rounded"
              >
                <X size={20} className="text-[#8F94A3] dark:text-[#9CA3AF]" />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter user's full name"
                  />
                  {errors.name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password (min 6 characters)"
                  />
                  {errors.password && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.password}</p>}
                </div>


                {/* Branch Selection - NEW FIELD */}
                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Branch *
                  </label>
                  <select
                    value={newUser.branch_id}
                    onChange={(e) => setNewUser({ ...newUser, branch_id: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={branches.length === 0}
                  >
                    <option value="">Select Branch</option>
                    {branches.filter(b => b.is_active).map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name} - {branch.city}
                      </option>
                    ))}
                  </select>
                  {errors.branch_id && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.branch_id}</p>}
                  {branches.length === 0 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Please add a branch before creating users
                    </p>
                  )}
                </div>

                {newUser.role !== 'Admin' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number (e.g., +919876543210)"
                      />
                      {errors.phone && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                        State
                      </label>
                      <select
                        value={newUser.state}
                        onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
                        className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {STATES.map((s) => (
                          <option key={s} value={s}>{s === "" ? "Select State" : s}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.state}</p>}
                    </div>

                  </>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setNewUser({ email: '', role: 'Technician', name: '', phone: '', state: ''});
                    setErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#8F94A3] dark:text-[#9CA3AF] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Edit User Modal (detailed) ---------------- */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
                Edit User
              </h3>
              <button
                onClick={cancelEdit}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#374151] rounded"
              >
                <X size={20} className="text-[#8F94A3] dark:text-[#9CA3AF]" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter user's full name"
                  />
                  {errors.name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
                </div>

                {/* Password Reset Section - Only show if there's a reset request */}
                {editingUser.passwordResetRequestId && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center">
                      <AlertTriangle size={16} className="mr-2" />
                      Password Reset Request
                    </h4>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-3">
                      This user has requested a password reset. Enter a new password below to approve the request.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={editingUser.newPassword || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                        className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password (min 6 characters)"
                        required
                      />
                      {editingUser.newPassword && editingUser.newPassword.length < 6 && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Password must be at least 6 characters</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number (e.g., +919876543210)"
                  />
                  {errors.phone && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    State
                  </label>
                  <select
                    value={editingUser.state || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, state: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s === "" ? "Select State" : s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Status
                  </label>
                  <select
                    value={editingUser.status || 'Active'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#8F94A3] dark:text-[#9CA3AF] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors duration-200"
                >
                  <X size={16} className="mr-2 inline" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Save size={16} className="mr-2 inline" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

SettingsView.displayName = 'SettingsView';
