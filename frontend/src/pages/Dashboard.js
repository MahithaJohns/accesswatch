import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topRisks, setTopRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (showToast = false) => {
    try {
      setRefreshing(true);
      
      const [statsResponse, topRisksResponse] = await Promise.all([
        fetch(`${API}/stats`),
        fetch(`${API}/analytics/top-risks`)
      ]);

      if (statsResponse.ok && topRisksResponse.ok) {
        const statsData = await statsResponse.json();
        const topRisksData = await topRisksResponse.json();
        
        setStats(statsData);
        setTopRisks(topRisksData);
        
        if (showToast) {
          toast.success('Dashboard data refreshed successfully');
        }
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Security Overview</h1>
          <Button disabled className="gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Overview</h1>
          <p className="text-gray-600 mt-1">Monitor MFA coverage and account security risks</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="gap-2"
            data-testid="refresh-dashboard-btn"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/users">
            <Button className="gap-2 security-button" data-testid="view-all-users-btn">
              <Eye className="h-4 w-4" />
              View All Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="security-card hover-lift" data-testid="total-users-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total_users}</div>
              <p className="text-xs text-gray-500 mt-1">Active accounts monitored</p>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="mfa-coverage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">MFA Coverage</CardTitle>
              <Shield className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.mfa_percentage}%</div>
              <div className="flex items-center space-x-2 mt-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-500">{stats.mfa_enabled} enabled</span>
                <XCircle className="h-4 w-4 text-red-500 ml-2" />
                <span className="text-xs text-gray-500">{stats.mfa_disabled} disabled</span>
              </div>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="breach-exposure-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Breach Exposure</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.breach_percentage}%</div>
              <p className="text-xs text-gray-500 mt-1">{stats.breached_users} users affected</p>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="avg-risk-score-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Risk Score</CardTitle>
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.avg_risk_score}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.high_risk_users} high-risk users</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Risk Users */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="security-card" data-testid="top-risks-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Top Risk Users
            </CardTitle>
            <CardDescription>
              Users with the highest security risk scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRisks.slice(0, 8).map((user, index) => (
                <div key={user.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link 
                        to={`/users/${encodeURIComponent(user.email)}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.department}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={getRiskBadgeVariant(user.risk_score)}
                    className="ml-2"
                  >
                    {user.risk_score} - {getRiskLevel(user.risk_score)}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/users?sort=risk">
                <Button variant="outline" className="w-full gap-2" data-testid="view-all-risks-btn">
                  <Eye className="h-4 w-4" />
                  View All Risk Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="security-card" data-testid="quick-actions-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common security monitoring tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/users?mfa_status=Not Enabled">
              <Button variant="outline" className="w-full justify-start gap-3 h-12" data-testid="users-no-mfa-btn">
                <XCircle className="h-5 w-5 text-red-500" />
                <div className="text-left">
                  <div className="font-medium">Users without MFA</div>
                  <div className="text-xs text-gray-500">Review accounts needing MFA setup</div>
                </div>
              </Button>
            </Link>
            
            <Link to="/users?min_risk=70">
              <Button variant="outline" className="w-full justify-start gap-3 h-12" data-testid="high-risk-users-btn">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="text-left">
                  <div className="font-medium">High Risk Users</div>
                  <div className="text-xs text-gray-500">Accounts requiring immediate attention</div>
                </div>
              </Button>
            </Link>
            
            <Link to="/analytics">
              <Button variant="outline" className="w-full justify-start gap-3 h-12" data-testid="view-analytics-btn">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Security Analytics</div>
                  <div className="text-xs text-gray-500">View trends and detailed charts</div>
                </div>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12" 
              onClick={() => {
                window.open(`${API}/export/csv`, '_blank');
                toast.success('Export started');
              }}
              data-testid="export-data-btn"
            >
              <Download className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium">Export All Data</div>
                <div className="text-xs text-gray-500">Download CSV report</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;