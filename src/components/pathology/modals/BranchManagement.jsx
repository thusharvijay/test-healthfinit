import { 
  Building,
  Plus,
  Edit3,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  X,
  Search,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

export function BranchManagement({ 
  branches = [],           // ✅ Receive from parent
  onAddBranch,            // ✅ Handler from useDashboardState
  onUpdateBranch,         // ✅ Handler from useDashboardState
  onDeleteBranch,         // ✅ Handler from useDashboardState
  onRefreshUsers,         // 🔹 optional - if parent provides a refresh function
  loading = false 
}) {

    const [searchQuery, setSearchQuery] = useState('');
    const [filterState, setFilterState] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [newBranch, setNewBranch] = useState({
      name: '', address: '', city: '', state: '', contactNumber: '', letterhead: null
    });
    const [errors, setErrors] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // ✅ NOW define mappedBranches here
    const mappedBranches = branches.map(b => ({
      id: b.id,
      name: b.branch_name,
      address: b.address,
      city: b.city,
      state: b.state,
      contactNumber: b.phone,
      status: b.is_active ? 'ACTIVE' : 'BLOCKED',
      totalReportsUploaded: b.user_count || 0,
      createdAt: b.created_at,
      updatedAt: b.created_at,
      is_main_branch: b.is_main_branch
    }));

  const validatePhone = (phone) => {
    return /^[0-9]{10,15}$/.test(String(phone).replace(/\D/g, ''));
  };

  const validateBranch = (branch) => {
    const newErrors = {};
    if (!branch.name || branch.name.length < 2 || branch.name.length > 80) {
      newErrors.name = 'Branch name must be 2-80 characters';
    }
    if (!branch.address || branch.address.length < 5) {
      newErrors.address = 'Please enter a valid address';
    }
    if (!branch.city) {
      newErrors.city = 'City is required';
    }
    if (!branch.state) {
      newErrors.state = 'State is required';
    }
    if (!validatePhone(branch.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10-15 digits';
    }
    return newErrors;
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    const newErrors = validateBranch(newBranch);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // ✅ Map to backend expected format
      const branchData = {
        branch_name: newBranch.name,  // Note: backend expects 'branch_name'
        address: newBranch.address,
        city: newBranch.city,
        state: newBranch.state,
        phone: newBranch.contactNumber  // Note: backend expects 'phone'
      };
      
      onAddBranch(branchData);  // ✅ Call parent handler
      setNewBranch({ name: '', address: '', city: '', state: '', contactNumber: '', letterhead: null });
      setShowAddModal(false);
      setErrors({});
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch({ ...branch });
  };

  const handleUpdateBranch = (e) => {
    e.preventDefault();
    const newErrors = validateBranch(editingBranch);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const updateData = {
        branch_name: editingBranch.name,
        address: editingBranch.address,
        city: editingBranch.city,
        state: editingBranch.state,
        phone: editingBranch.contactNumber,
        is_active: editingBranch.status === 'ACTIVE'
      };
      
      onUpdateBranch(editingBranch.id, updateData);  // ✅ Call parent handler
      setEditingBranch(null);
      setErrors({});
    }
  };

const handleToggleStatus = (branchId) => {
  const branch = mappedBranches.find(b => b.id === branchId);
  if (!branch) return;

  setConfirmAction({
    title: branch.status === 'ACTIVE' ? 'Block Branch' : 'Unblock Branch',
    message: branch.status === 'ACTIVE' 
      ? 'Blocking this branch will also block all associated technicians. They will not be able to access the system until the branch is unblocked.' 
      : 'This will allow operations to resume for this branch and its associated users.',
    onConfirm: async () => {
      const updateData = {
        branch_name: branch.name,
        address: branch.address,
        city: branch.city,
        state: branch.state,
        phone: branch.contactNumber,
        is_active: branch.status !== 'ACTIVE'
      };

      await onUpdateBranch(branchId, updateData);

      // ✅ Ensure this is defined in props before calling
      if (typeof onRefreshUsers === "function") {
        await onRefreshUsers();
      }

      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  });

  setShowConfirmModal(true);
};


  const handleDeleteBranch = (branchId) => {
    setConfirmAction({
      title: 'Delete Branch',
      message: 'This action cannot be undone. All associated data will be permanently removed.',
      onConfirm: () => {
        onDeleteBranch(branchId);  // ✅ Call parent handler
        setShowConfirmModal(false);
        setConfirmAction(null);
      }
    });
    setShowConfirmModal(true);
  };

  // Filter branches
  const filteredBranches = mappedBranches.filter(branch => {
    const matchesSearch = !searchQuery || 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = !filterState || branch.state === filterState;
    const matchesStatus = filterStatus === 'ALL' || branch.status === filterStatus;
    return matchesSearch && matchesState && matchesStatus;
  });

  // Calculate summary
  const totalBranches = mappedBranches.length;
  const activeBranches = mappedBranches.filter(b => b.status === 'ACTIVE').length;
  const blockedBranches = mappedBranches.filter(b => b.status === 'BLOCKED').length;
  const totalReports = mappedBranches.reduce((acc, b) => acc + (b.totalReportsUploaded || 0), 0);

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-1">
        Branch Management
      </h3>
      <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mb-6">
        Manage lab branches, locations, and their status
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#262626] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-4">
          <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">Total Branches</div>
          <div className="text-2xl font-semibold mt-1 text-[#151515] dark:text-[#F9FAFB]">{totalBranches}</div>
        </div>
        <div className="bg-white dark:bg-[#262626] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-4">
          <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">Active</div>
          <div className="text-2xl font-semibold mt-1 text-green-600 dark:text-green-400">{activeBranches}</div>
        </div>
        <div className="bg-white dark:bg-[#262626] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-4">
          <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">Blocked</div>
          <div className="text-2xl font-semibold mt-1 text-red-600 dark:text-red-400">{blockedBranches}</div>
        </div>
        <div className="bg-white dark:bg-[#262626] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-4">
          <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">Total Reports</div>
          <div className="text-2xl font-semibold mt-1 text-[#151515] dark:text-[#F9FAFB]">{totalReports}</div>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F94A3] dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name, city, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All States</option>
              {STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus size={16} className="mr-2" />
          Add Branch
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg overflow-hidden">
        {filteredBranches.length === 0 ? (
          <div className="p-8 text-center">
            <Building size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h4 className="text-lg font-medium text-[#151515] dark:text-[#F9FAFB] mb-2">
              No branches found
            </h4>
            <p className="text-[#8F94A3] dark:text-[#9CA3AF] mb-4">
              {branches.length === 0 ? "Add your first branch to get started" : "Try adjusting your search filters"}
            </p>
            {branches.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Add First Branch
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#F6F8FA] dark:bg-[#262626]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">Branch</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">City</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">State</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">Users</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#6E7380] dark:text-[#9CA3AF]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8F0] dark:divide-[#2A2A2A]">
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-[#F7F9FC] dark:hover:bg-[#262626] transition-colors duration-200">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#151515] dark:text-[#F9FAFB]">{branch.name}</div>
                      <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">{branch.address}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#151515] dark:text-[#F9FAFB]">{branch.city}</td>
                    <td className="px-4 py-3 text-sm text-[#151515] dark:text-[#F9FAFB]">{branch.state}</td>
                    <td className="px-4 py-3 text-sm text-[#151515] dark:text-[#F9FAFB]">{branch.contactNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        branch.status === 'ACTIVE'
                          ? 'text-[#22A447] dark:text-[#4ADE80] bg-[#E8F8EE] dark:bg-[#1A4A2E] border border-[#BFE6CE] dark:border-[#2E7D32]'
                          : 'text-[#DC2626] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#4A1D1F] border border-[#FECACA] dark:border-[#7F1D1D]'
                      }`}>
                        {branch.status === 'ACTIVE' ? <Eye size={12} className="mr-1" /> : <EyeOff size={12} className="mr-1" />}
                        {branch.status === 'ACTIVE' ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#151515] dark:text-[#F9FAFB]">{branch.totalReportsUploaded || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditBranch(branch)}
                          className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group"
                          title="Edit branch"
                        >
                          <Edit3 size={16} className="text-[#525A6B] group-hover:text-[#1F2937] dark:text-[#9CA3AF] dark:group-hover:text-[#E5E7EB] transition-colors duration-200" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(branch.id)}
                          className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group"
                          title={branch.status === 'ACTIVE' ? 'Block branch' : 'Unblock branch'}
                        >
                          {branch.status === 'ACTIVE' ? (
                            <Shield size={16} className="text-orange-500 group-hover:text-orange-600 dark:text-orange-400 dark:group-hover:text-orange-300 transition-colors duration-200" />
                          ) : (
                            <ShieldCheck size={16} className="text-green-600 group-hover:text-green-700 dark:text-green-400 dark:group-hover:text-green-300 transition-colors duration-200" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
                          disabled={true}  // Temporarily disabled
                          className="p-1 rounded hover:bg-[#F7F9FC] dark:hover:bg-[#374151] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete branch (Coming soon)"
                        >
                          <Trash2 size={16} className="text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300 transition-colors duration-200" />
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

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">Add New Branch</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewBranch({ name: '', address: '', city: '', state: '', contactNumber: '', letterhead: null });
                  setErrors({});
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#374151] rounded"
              >
                <X size={20} className="text-[#8F94A3] dark:text-[#9CA3AF]" />
              </button>
            </div>

            <form onSubmit={handleAddBranch}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Patho Clinic – Andheri"
                  />
                  {errors.name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Branch Address *
                  </label>
                  <textarea
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street, Area, Landmark"
                  />
                  {errors.address && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={newBranch.city}
                      onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                      className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai"
                    />
                    {errors.city && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                      State *
                    </label>
                    <select
                      value={newBranch.state}
                      onChange={(e) => setNewBranch({ ...newBranch, state: e.target.value })}
                      className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={newBranch.contactNumber}
                    onChange={(e) => setNewBranch({ ...newBranch, contactNumber: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10-15 digits"
                  />
                  {errors.contactNumber && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.contactNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Branch Letterhead (PNG/JPG/PDF)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={(e) => setNewBranch({ ...newBranch, letterhead: e.target.files[0] })}
                    className="block w-full text-sm text-[#151515] dark:text-[#F9FAFB] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                  />
                  {newBranch.letterhead && (
                    <div className="mt-2 text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                      Selected: {newBranch.letterhead.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewBranch({ name: '', address: '', city: '', state: '', contactNumber: '', letterhead: null });
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
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {editingBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">Edit Branch</h3>
              <button
                onClick={() => {
                  setEditingBranch(null);
                  setErrors({});
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#374151] rounded"
              >
                <X size={20} className="text-[#8F94A3] dark:text-[#9CA3AF]" />
              </button>
            </div>

            <form onSubmit={handleUpdateBranch}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    value={editingBranch.name || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Patho Clinic – Andheri"
                  />
                  {errors.name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Branch Address *
                  </label>
                  <textarea
                    value={editingBranch.address || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street, Area, Landmark"
                  />
                  {errors.address && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={editingBranch.city || ''}
                      onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
                      className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai"
                    />
                    {errors.city && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                      State *
                    </label>
                    <select
                      value={editingBranch.state || ''}
                      onChange={(e) => setEditingBranch({ ...editingBranch, state: e.target.value })}
                      className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={editingBranch.contactNumber || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, contactNumber: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10-15 digits"
                  />
                  {errors.contactNumber && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.contactNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Status
                  </label>
                  <select
                    value={editingBranch.status || 'ACTIVE'}
                    onChange={(e) => setEditingBranch({ ...editingBranch, status: e.target.value })}
                    className="w-full h-10 px-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#151515] dark:text-[#F9FAFB] mb-1">
                    Branch Letterhead (PNG/JPG/PDF)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={(e) => setEditingBranch({ ...editingBranch, letterhead: e.target.files[0] })}
                    className="block w-full text-sm text-[#151515] dark:text-[#F9FAFB] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                  />
                  {editingBranch.letterheadName && (
                    <div className="mt-2 text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                      Current: {editingBranch.letterheadName}
                    </div>
                  )}
                  {editingBranch.letterhead && (
                    <div className="mt-2 text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                      New: {editingBranch.letterhead.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBranch(null);
                    setErrors({});
                  }}
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

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-2">
              {confirmAction.title}
            </h3>
            <p className="text-[#8F94A3] dark:text-[#9CA3AF] mb-6">
              {confirmAction.message}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#8F94A3] dark:text-[#9CA3AF] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Yes, proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
