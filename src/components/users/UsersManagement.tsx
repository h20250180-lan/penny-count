import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter
} from 'lucide-react';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { dataService } from '../../services/dataService';

export const UsersManagement: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]); // Start with empty array
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersData = await dataService.getUsers();
        // Normalize backend data: map _id -> id and convert createdAt strings to Date
        const normalized = usersData.map((u: any) => ({
          ...u,
          id: u.id ? String(u.id) : (u._id ? (typeof u._id === 'string' ? u._id : (u._id && u._id.toString ? u._id.toString() : String(u._id))) : undefined),
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          name: u.name || 'Unnamed'
        }));
        setUsers(normalized);
      } catch (error: any) {
        setError(error.message || 'Error loading users');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700';
      case 'co-owner':
        return 'bg-blue-100 text-blue-700';
      case 'agent':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield className="w-4 h-4" />;
      case 'co-owner':
        return <UserCheck className="w-4 h-4" />;
      case 'agent':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
    setError(null);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const newUser = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as 'co-owner' | 'agent',
      isActive: true
    };
    try {
      // Use Supabase signup to create auth user
      const { supabase } = await import('../../lib/supabase');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
            phone: newUser.phone,
            role: newUser.role
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Refresh users list
      const usersData = await dataService.getUsers();
      const normalized = usersData.map((u: any) => ({
        ...u,
        id: u.id ? String(u.id) : (u._id ? (typeof u._id === 'string' ? u._id : (u._id && u._id.toString ? u._id.toString() : String(u._id))) : undefined),
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        name: u.name || 'Unnamed'
      }));
      setUsers(normalized);
      setShowCreateModal(false);
    } catch (error: any) {
      setError(error.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
    setError(null);
  };

  const handleToggleUserStatus = async (userId: string) => {
    setError(null);
    setLoading(true);
    try {
      if (!userId) {
        setError('Missing user id');
        return;
      }
      const user = users.find(u => u.id === userId);
      if (!user) {
        setError('User not found');
        return;
      }
      const updatedUser = await dataService.updateUser(userId, { isActive: !user.isActive });
      // Normalize returned user if necessary
      const norm = {
        ...updatedUser,
        id: updatedUser.id || updatedUser._id || (updatedUser._id && updatedUser._id.toString && updatedUser._id.toString())
      } as any;
      setUsers(users.map(u => (u.id === userId ? norm : u)));
    } catch (error: any) {
      setError(error.message || 'Error updating user status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setError(null);
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setLoading(true);
      try {
        await dataService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error: any) {
        setError(error.message || 'Error deleting user');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      {loading && <div className="text-gray-500">Loading...</div>}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users & Agents</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateUser}
          className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addUser')}</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{t('owners')}</h3>
          <p className="text-2xl font-bold text-gray-800">
            {users.filter(u => u.role === 'owner').length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{t('coOwners')}</h3>
          <p className="text-2xl font-bold text-gray-800">
            {users.filter(u => u.role === 'co-owner').length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{t('agents')}</h3>
          <p className="text-2xl font-bold text-gray-800">
            {users.filter(u => u.role === 'agent').length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Users</h3>
          <p className="text-2xl font-bold text-gray-800">
            {users.filter(u => u.isActive).length}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">{t('allRoles')}</option>
              <option value="owner">{t('owners')}</option>
              <option value="co-owner">{t('coOwners')}</option>
              <option value="agent">{t('agents')}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">User</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Role</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Phone</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Created</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{user.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{user.createdAt && user.createdAt.toLocaleDateString ? user.createdAt.toLocaleDateString() : new Date().toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New User</h2>
            <form className="space-y-4" onSubmit={handleCreateUserSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select name="role" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                  <option value="">{t('selectRole')}</option>
                  <option value="co-owner">{t('coOwner')}</option>
                  <option value="agent">{t('agent')}</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit User</h2>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                if (!selectedUser || !selectedUser.id) throw new Error('Missing user id');
                const form = new FormData(e.currentTarget as HTMLFormElement);
                const updates: any = {
                  name: form.get('name') as string,
                  phone: form.get('phone') as string,
                  role: form.get('role') as string,
                };
                const updated = await dataService.updateUser(selectedUser.id, updates);
                const norm = { ...updated, id: updated.id || updated._id || (updated._id && updated._id.toString && updated._id.toString()) } as any;
                setUsers(users.map(u => u.id === selectedUser.id ? norm : u));
                setShowEditModal(false);
                setSelectedUser(null);
              } catch (err: any) {
                setError(err.message || 'Failed to update user');
              } finally {
                setLoading(false);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input defaultValue={selectedUser.name} name="name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input defaultValue={selectedUser.phone} name="phone" type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select defaultValue={selectedUser.role} name="role" className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="owner">{t('owner')}</option>
                  <option value="co-owner">{t('coOwner')}</option>
                  <option value="agent">{t('agent')}</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg">Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};