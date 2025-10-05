import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Briefcase, 
  Building,
  Monitor,
  Shield,
  CheckCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AddStaff = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    department: '',
    device_id: '',
    device_name: '',
    device_type: '',
    mfa_status: 'Not Enabled',
    mfa_methods: []
  });

  const departments = ['IT', 'Finance', 'HR', 'Marketing', 'Sales', 'Operations', 'Legal', 'Engineering'];
  const roles = ['Admin', 'Manager', 'User', 'Finance Manager', 'HR Director', 'IT Specialist', 'Sales Rep'];
  const deviceTypes = ['Windows', 'macOS', 'Linux'];
  const mfaMethods = ['Authenticator App', 'SMS', 'Hardware Token', 'Email'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMfaMethodChange = (method, checked) => {
    setFormData(prev => ({
      ...prev,
      mfa_methods: checked 
        ? [...prev.mfa_methods, method]
        : prev.mfa_methods.filter(m => m !== method)
    }));
  };

  const generateDeviceId = () => {
    const prefix = formData.device_type === 'Windows' ? 'WS' : 
                   formData.device_type === 'macOS' ? 'LT' : 'DT';
    const id = `HU-${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
    handleInputChange('device_id', id);
  };

  const generateDeviceName = () => {
    if (formData.name && formData.device_type) {
      const firstName = formData.name.split(' ')[0].toUpperCase();
      const prefix = formData.device_type === 'Windows' ? 'WIN' :
                     formData.device_type === 'macOS' ? 'MAC' : 'LNX';
      const name = `${prefix}-${firstName}-${Math.floor(Math.random() * 90) + 10}`;
      handleInputChange('device_name', name);
    }
  };

  const validateForm = () => {
    if (!formData.email) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.email.includes('@halmstad.se')) {
      toast.error('Email must be a valid Halmstad University address (@halmstad.se)');
      return false;
    }
    if (!formData.name) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.role) {
      toast.error('Role is required');
      return false;
    }
    if (!formData.department) {
      toast.error('Department is required');
      return false;
    }
    if (!formData.device_id) {
      toast.error('Device ID is required');
      return false;
    }
    if (!formData.device_name) {
      toast.error('Device name is required');
      return false;
    }
    if (!formData.device_type) {
      toast.error('Device type is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newUser = await response.json();
        toast.success(`Successfully added ${newUser.name} to the system`);
        navigate('/users');
      } else if (response.status === 400) {
        const error = await response.json();
        toast.error(error.detail || 'Failed to add staff member');
      } else {
        toast.error('Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Error adding staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="add-staff-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="outline" className="gap-2" data-testid="back-to-users-btn">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Staff</h1>
            <p className="text-gray-600 mt-1">Create a new staff account with device tracking</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="security-card" data-testid="personal-info-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Basic staff member details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    data-testid="name-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@halmstad.se"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    data-testid="email-input"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger data-testid="role-select">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger data-testid="department-select">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card className="security-card" data-testid="device-info-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-600" />
                Device Information
              </CardTitle>
              <CardDescription>
                Device details for security monitoring and troubleshooting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="device_type">Device Type *</Label>
                  <Select 
                    value={formData.device_type} 
                    onValueChange={(value) => {
                      handleInputChange('device_type', value);
                      // Auto-generate device name when type changes
                      if (formData.name && value) {
                        setTimeout(() => generateDeviceName(), 100);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="device-type-select">
                      <SelectValue placeholder="Select OS" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="device_id">Device ID *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="device_id"
                      placeholder="HU-WS-1234"
                      value={formData.device_id}
                      onChange={(e) => handleInputChange('device_id', e.target.value)}
                      data-testid="device-id-input"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateDeviceId}
                      data-testid="generate-device-id-btn"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="device_name">Device Name *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="device_name"
                      placeholder="WIN-ALICE-01"
                      value={formData.device_name}
                      onChange={(e) => handleInputChange('device_name', e.target.value)}
                      data-testid="device-name-input"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateDeviceName}
                      disabled={!formData.name || !formData.device_type}
                      data-testid="generate-device-name-btn"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Configuration */}
          <Card className="security-card" data-testid="security-config-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Multi-factor authentication setup and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>MFA Status</Label>
                <Select 
                  value={formData.mfa_status} 
                  onValueChange={(value) => {
                    handleInputChange('mfa_status', value);
                    if (value === 'Not Enabled') {
                      handleInputChange('mfa_methods', []);
                    }
                  }}
                >
                  <SelectTrigger data-testid="mfa-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enabled">Enabled</SelectItem>
                    <SelectItem value="Not Enabled">Not Enabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.mfa_status === 'Enabled' && (
                <div className="space-y-3">
                  <Label>MFA Methods</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {mfaMethods.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={method}
                          checked={formData.mfa_methods.includes(method)}
                          onCheckedChange={(checked) => handleMfaMethodChange(method, checked)}
                          data-testid={`mfa-method-${method.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <Label htmlFor={method} className="text-sm">{method}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Form Actions */}
          <Card className="security-card" data-testid="form-actions-card">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
              <CardDescription>
                Save the new staff member to the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                type="submit" 
                className="w-full gap-2 security-button" 
                disabled={loading}
                data-testid="save-staff-btn"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Staff Member
                  </>
                )}
              </Button>
              
              <Link to="/users">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full gap-2"
                  data-testid="cancel-btn"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="security-card border-amber-200 bg-amber-50" data-testid="security-notice-card">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <div className="font-medium mb-2">Security Guidelines</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Use official Halmstad University email addresses</li>
                    <li>• Enable MFA for privileged accounts</li>
                    <li>• Ensure device IDs are unique and trackable</li>
                    <li>• Document device assignments for security audits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Preview */}
          <Card className="security-card" data-testid="risk-preview-card">
            <CardHeader>
              <CardTitle className="text-lg">Risk Assessment Preview</CardTitle>
              <CardDescription>
                Estimated security risk for this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">MFA Status</span>
                  <span className={`text-sm font-medium ${
                    formData.mfa_status === 'Enabled' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.mfa_status === 'Enabled' ? '+0' : '+30'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Privileged Role</span>
                  <span className={`text-sm font-medium ${
                    ['Admin', 'Finance Manager', 'HR Director', 'IT Specialist'].includes(formData.role)
                      ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {['Admin', 'Finance Manager', 'HR Director', 'IT Specialist'].includes(formData.role)
                      ? '+40' : '+0'}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Estimated Risk Score</span>
                    <span className="font-bold text-lg text-gray-900">
                      {(formData.mfa_status === 'Not Enabled' ? 30 : 0) + 
                       (['Admin', 'Finance Manager', 'HR Director', 'IT Specialist'].includes(formData.role) ? 40 : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AddStaff;