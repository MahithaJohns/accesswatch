import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('department') || 'all');
  const [mfaFilter, setMfaFilter] = useState(searchParams.get('mfa_status') || 'all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Departments for filter
  const departments = ['IT', 'Finance', 'HR', 'Marketing', 'Sales', 'Operations', 'Legal', 'Engineering'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (departmentFilter && departmentFilter !== 'all') params.append('department', departmentFilter);
      if (mfaFilter && mfaFilter !== 'all') params.append('mfa_status', mfaFilter);
      if (riskFilter === 'high') {
        params.append('min_risk', '70');
      } else if (riskFilter === 'medium') {
        params.append('min_risk', '40');
        params.append('max_risk', '69');
      } else if (riskFilter === 'low') {
        params.append('max_risk', '39');
      }

      const response = await fetch(`${API}/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        // Sort the data
        const sortedData = [...data].sort((a, b) => {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'email':
              aValue = a.email.toLowerCase();
              bValue = b.email.toLowerCase();
              break;
            case 'risk':
              aValue = a.risk_score;
              bValue = b.risk_score;
              break;
            case 'department':
              aValue = a.department.toLowerCase();
              bValue = b.department.toLowerCase();
              break;
            case 'last_login':
              aValue = new Date(a.last_login);
              bValue = new Date(b.last_login);
              break;
            default:
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
          }
          
          if (sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
        
        setUsers(sortedData);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Update URL params
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (departmentFilter && departmentFilter !== 'all') params.append('department', departmentFilter);
    if (mfaFilter && mfaFilter !== 'all') params.append('mfa_status', mfaFilter);
    setSearchParams(params);
  }, [search, departmentFilter, mfaFilter, riskFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (departmentFilter && departmentFilter !== 'all') params.append('department', departmentFilter);
    if (mfaFilter && mfaFilter !== 'all') params.append('mfa_status', mfaFilter);
    
    window.open(`${API}/export/csv?${params}`, '_blank');
    toast.success('Export started');
  };

  const getRiskBadgeVariant = (score) => {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'secondary';
    return 'default';
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const SortButton = ({ field, children }) => {
    const isActive = sortBy === field;
    const SortIcon = isActive && sortOrder === 'desc' ? SortDesc : SortAsc;
    
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1 text-xs font-medium transition-colors hover:text-gray-900 ${
          isActive ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        {children}
        <SortIcon className="h-3 w-3" />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Monitor user accounts, MFA status, and security risks</p>
        </div>
        <div className="flex gap-3">
          <Link to="/users/add">
            <Button 
              className="gap-2 security-button"
              data-testid="add-staff-btn"
            >
              <User className="h-4 w-4" />
              Add Staff
            </Button>
          </Link>
          <Button 
            onClick={handleExport}
            className="gap-2 export-button"
            data-testid="export-users-btn"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="security-card" data-testid="filters-card">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>
            Filter users by department, MFA status, risk level, or search by name/email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger data-testid="department-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">MFA Status</label>
              <Select value={mfaFilter} onValueChange={setMfaFilter}>
                <SelectTrigger data-testid="mfa-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="Enabled">MFA Enabled</SelectItem>
                  <SelectItem value="Not Enabled">MFA Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Risk Level</label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger data-testid="risk-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk (70+)</SelectItem>
                  <SelectItem value="medium">Medium Risk (40-69)</SelectItem>
                  <SelectItem value="low">Low Risk (&lt;40)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="risk">Risk Score</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="last_login">Last Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between py-2" data-testid="results-summary">
          <p className="text-sm text-gray-600">
            Showing {users.length} users
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {users.filter(u => u.mfa_status === 'Enabled').length} with MFA
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              {users.filter(u => u.mfa_status === 'Not Enabled').length} without MFA
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              {users.filter(u => u.risk_score >= 70).length} high risk
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <Card className="security-card" data-testid="users-table-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4">
                      <SortButton field="name">User</SortButton>
                    </th>
                    <th className="text-left py-3 px-4">
                      <SortButton field="department">Department</SortButton>
                    </th>
                    <th className="text-left py-3 px-4">Device Info</th>
                    <th className="text-left py-3 px-4">MFA Status</th>
                    <th className="text-left py-3 px-4">Breach Status</th>
                    <th className="text-left py-3 px-4">
                      <SortButton field="last_login">Last Login</SortButton>
                    </th>
                    <th className="text-left py-3 px-4">
                      <SortButton field="risk">Risk Score</SortButton>
                    </th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.role}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.department}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {user.mfa_status === 'Enabled' ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-700">Enabled</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-red-700">Not Enabled</span>
                            </>
                          )}
                        </div>
                        {user.mfa_methods && user.mfa_methods.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {user.mfa_methods.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {user.breached ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-red-700">Yes</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-700">No</span>
                            </>
                          )}
                        </div>
                        {user.breach_sources && user.breach_sources.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {user.breach_sources.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatLastLogin(user.last_login)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {user.suspicious_logins > 0 && (
                            <span className="text-red-600">{user.suspicious_logins} suspicious</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={getRiskBadgeVariant(user.risk_score)}
                          className="font-medium"
                        >
                          {user.risk_score} - {getRiskLevel(user.risk_score)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Link to={`/users/${encodeURIComponent(user.email)}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            data-testid={`view-user-${user.email}-btn`}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;