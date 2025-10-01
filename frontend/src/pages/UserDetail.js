import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock, 
  MapPin, 
  Download,
  Mail,
  User,
  Building,
  Briefcase,
  Activity,
  Eye,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDetail = () => {
  const { email } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/users/${encodeURIComponent(email)}`);
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load user details');
        }
      } catch (error) {
        console.error('Error fetching user detail:', error);
        setError('Error loading user details');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchUserDetail();
    }
  }, [email]);

  const getRiskLevel = (score) => {
    if (score >= 70) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (score >= 40) return { level: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
        
        <Card className="security-card text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-600 mb-4">The requested user could not be found or loaded.</p>
            <Link to="/users">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Users List
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskInfo = getRiskLevel(user.risk_score);

  return (
    <div className="space-y-6" data-testid="user-detail-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="outline" className="gap-2" data-testid="back-to-users-btn">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              window.open(`${API}/export/csv?search=${encodeURIComponent(user.email)}`, '_blank');
              toast.success('User export started');
            }}
            data-testid="export-user-btn"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* User Profile Header */}
      <Card className="security-card" data-testid="user-profile-card">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-1 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{user.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{user.department}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`px-6 py-4 rounded-lg border-2 ${riskInfo.bg} ${riskInfo.border}`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${riskInfo.color}`}>{user.risk_score}</div>
                <div className={`text-sm font-medium ${riskInfo.color}`}>{riskInfo.level} Risk</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Status */}
          <Card className="security-card" data-testid="security-status-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Security Status
              </CardTitle>
              <CardDescription>
                Multi-factor authentication and security configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {user.mfa_status === 'Enabled' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">Multi-Factor Authentication</div>
                    <div className={`text-sm ${user.mfa_status === 'Enabled' ? 'text-green-600' : 'text-red-600'}`}>
                      {user.mfa_status}
                    </div>
                  </div>
                </div>
                {user.mfa_methods && user.mfa_methods.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Methods:</div>
                    <div className="text-sm text-gray-600">{user.mfa_methods.join(', ')}</div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {user.breached ? (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  ) : (
                    <Shield className="h-6 w-6 text-green-500" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">Breach Exposure</div>
                    <div className={`text-sm ${user.breached ? 'text-red-600' : 'text-green-600'}`}>
                      {user.breached ? 'Detected' : 'No breaches found'}
                    </div>
                  </div>
                </div>
                {user.breach_sources && user.breach_sources.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Sources:</div>
                    <div className="text-sm text-red-600">{user.breach_sources.join(', ')}</div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900">Suspicious Activity</div>
                    <div className={`text-sm ${user.suspicious_logins > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {user.suspicious_logins > 0 ? `${user.suspicious_logins} suspicious logins` : 'No suspicious activity'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Last Login:</div>
                  <div className="text-sm text-gray-600">{formatTimeAgo(user.last_login)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breach History */}
          {user.breach_history && user.breach_history.length > 0 && (
            <Card className="security-card" data-testid="breach-history-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Breach History
                </CardTitle>
                <CardDescription>
                  Known data breaches affecting this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.breach_history.map((breach, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{breach.source}</div>
                        <div className="text-sm text-gray-600">{breach.type}</div>
                      </div>
                      <div className="text-sm text-gray-500">{formatTimeAgo(breach.date)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Login History */}
          <Card className="security-card" data-testid="login-history-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Login Activity
              </CardTitle>
              <CardDescription>
                Latest login attempts and access patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.login_history && user.login_history.slice(0, 10).map((login, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                    login.suspicious 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {login.suspicious ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(login.timestamp)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{login.ip_address}</span>
                          {login.location && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{login.location}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {login.suspicious && (
                      <Badge variant="destructive" className="text-xs">
                        Suspicious
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk Breakdown */}
          <Card className="security-card" data-testid="risk-breakdown-card">
            <CardHeader>
              <CardTitle className="text-lg">Risk Score Breakdown</CardTitle>
              <CardDescription>
                Factors contributing to the user's security risk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.risk_breakdown && Object.entries(user.risk_breakdown).map(([factor, score]) => {
                const factorNames = {
                  mfa_disabled: 'MFA Not Enabled',
                  breach_exposure: 'Data Breach Exposure',
                  privileged_role: 'Privileged Account',
                  suspicious_activity: 'Suspicious Activity'
                };
                
                const factorName = factorNames[factor] || factor;
                const isActive = score > 0;
                
                return (
                  <div key={factor} className={`p-3 rounded-lg border-2 ${
                    isActive 
                      ? score >= 30 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-amber-50 border-amber-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        isActive 
                          ? score >= 30 
                            ? 'text-red-700' 
                            : 'text-amber-700'
                          : 'text-gray-600'
                      }`}>
                        {factorName}
                      </span>
                      <span className={`font-bold ${
                        isActive 
                          ? score >= 30 
                            ? 'text-red-700' 
                            : 'text-amber-700'
                          : 'text-gray-500'
                      }`}>
                        +{score}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              <Separator className="my-4" />
              
              <div className={`p-3 rounded-lg border-2 ${riskInfo.bg} ${riskInfo.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${riskInfo.color}`}>Total Risk Score</span>
                  <span className={`text-xl font-bold ${riskInfo.color}`}>{user.risk_score}</span>
                </div>
                <div className={`text-sm mt-1 ${riskInfo.color}`}>
                  {riskInfo.level} Risk Level
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="security-card" data-testid="quick-actions-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common actions for this user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  window.open(`${API}/maltego/mfa/${encodeURIComponent(user.email)}`, '_blank');
                  toast.success('MFA status exported for Maltego');
                }}
                data-testid="maltego-mfa-btn"
              >
                <Shield className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">MFA Status (Maltego)</div>
                  <div className="text-xs text-gray-500">Export MFA data</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  window.open(`${API}/maltego/breach/${encodeURIComponent(user.email)}`, '_blank');
                  toast.success('Breach data exported for Maltego');
                }}
                data-testid="maltego-breach-btn"
              >
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="text-left">
                  <div className="font-medium">Breach Data (Maltego)</div>
                  <div className="text-xs text-gray-500">Export breach info</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  window.open(`${API}/maltego/risk/${encodeURIComponent(user.email)}`, '_blank');
                  toast.success('Risk score exported for Maltego');
                }}
                data-testid="maltego-risk-btn"
              >
                <Activity className="h-5 w-5 text-amber-500" />
                <div className="text-left">
                  <div className="font-medium">Risk Score (Maltego)</div>
                  <div className="text-xs text-gray-500">Export risk data</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => {
                  const url = `${API}/breach/${encodeURIComponent(user.email)}`;
                  window.open(url, '_blank');
                  toast.success('Breach lookup initiated');
                }}
                data-testid="breach-lookup-btn"
              >
                <Eye className="h-5 w-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Breach Lookup</div>
                  <div className="text-xs text-gray-500">Check latest breaches</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* User Metadata */}
          <Card className="security-card" data-testid="user-metadata-card">
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-gray-700">Account Created</div>
                <div className="text-gray-600">{formatTimeAgo(user.created_at)}</div>
              </div>
              
              <Separator />
              
              <div className="text-sm">
                <div className="font-medium text-gray-700">Last Login</div>
                <div className="text-gray-600">{formatDate(user.last_login)}</div>
              </div>
              
              <Separator />
              
              <div className="text-sm">
                <div className="font-medium text-gray-700">User ID</div>
                <div className="text-gray-600 break-all font-mono text-xs">{user.id}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;