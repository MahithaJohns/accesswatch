import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  Download,
  Users,
  Shield,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [mfaTrend, setMfaTrend] = useState([]);
  const [topRisks, setTopRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async (showToast = false) => {
    try {
      setRefreshing(true);
      
      const [statsResponse, trendResponse, risksResponse] = await Promise.all([
        fetch(`${API}/stats`),
        fetch(`${API}/analytics/mfa-trend`),
        fetch(`${API}/analytics/top-risks`)
      ]);

      if (statsResponse.ok && trendResponse.ok && risksResponse.ok) {
        const [statsData, trendData, risksData] = await Promise.all([
          statsResponse.json(),
          trendResponse.json(),
          risksResponse.json()
        ]);
        
        setStats(statsData);
        setMfaTrend(trendData);
        setTopRisks(risksData);
        
        if (showToast) {
          toast.success('Analytics data refreshed successfully');
        }
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Error loading analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    fetchAnalyticsData(true);
  };

  // Calculate trend direction
  const getMfaTrend = () => {
    if (mfaTrend.length < 2) return { direction: 'stable', change: 0 };
    
    const latest = mfaTrend[mfaTrend.length - 1]?.mfa_percentage || 0;
    const previous = mfaTrend[mfaTrend.length - 8]?.mfa_percentage || latest; // Week ago
    const change = (latest - previous).toFixed(1);
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change)
    };
  };

  const getRiskDistribution = () => {
    if (!stats) return { high: 0, medium: 0, low: 0 };
    
    // Mock distribution based on stats
    const high = stats.high_risk_users;
    const medium = Math.floor(stats.total_users * 0.25) - high;
    const low = stats.total_users - high - medium;
    
    return { high: Math.max(0, high), medium: Math.max(0, medium), low: Math.max(0, low) };
  };

  const mfaTrend_ = getMfaTrend();
  const riskDist = getRiskDistribution();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Security Analytics</h1>
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
    <div className="space-y-6" data-testid="analytics-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Analytics</h1>
          <p className="text-gray-600 mt-1">Analyze security trends, patterns, and risk distributions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="gap-2"
            data-testid="refresh-analytics-btn"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="gap-2 export-button"
            onClick={() => {
              window.open(`${API}/export/csv`, '_blank');
              toast.success('Full analytics export started');
            }}
            data-testid="export-analytics-btn"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="security-card hover-lift" data-testid="mfa-coverage-metric">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">MFA Coverage</CardTitle>
              <Shield className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.mfa_percentage}%</div>
              <div className="flex items-center mt-2">
                {mfaTrend_.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : mfaTrend_.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm ${
                  mfaTrend_.direction === 'up' ? 'text-green-600' : 
                  mfaTrend_.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {mfaTrend_.direction === 'stable' ? 'Stable' : `${mfaTrend_.change}% this week`}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="breach-exposure-metric">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Breach Exposure</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.breach_percentage}%</div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.breached_users} of {stats.total_users} users affected
              </p>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="avg-risk-metric">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Risk Score</CardTitle>
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.avg_risk_score}</div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.high_risk_users} users need immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="total-users-metric">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total_users}</div>
              <p className="text-sm text-gray-600 mt-2">Active accounts monitored</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* MFA Adoption Trend */}
        <Card className="security-card" data-testid="mfa-trend-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              MFA Adoption Trend (30 Days)
            </CardTitle>
            <CardDescription>
              Track MFA enrollment progress over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple trend visualization */}
              <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">MFA Trend Visualization</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">30 Days</div>
                      <div className="text-gray-500">Period</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        mfaTrend_.direction === 'up' ? 'text-green-600' : 
                        mfaTrend_.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {mfaTrend_.direction === 'stable' ? '→' : 
                         mfaTrend_.direction === 'up' ? '↗' : '↘'}
                      </div>
                      <div className="text-gray-500">Trend</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{mfaTrend_.change}%</div>
                      <div className="text-gray-500">Change</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Trend data points */}
              <div className="grid grid-cols-7 gap-2 text-xs">
                {mfaTrend.slice(-7).map((point, index) => (
                  <div key={index} className="text-center">
                    <div className="h-12 bg-blue-100 rounded flex items-end justify-center mb-1">
                      <div 
                        className="bg-blue-500 rounded-t w-full"
                        style={{ height: `${(point.mfa_percentage / 100) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-gray-600">{point.mfa_percentage}%</div>
                    <div className="text-gray-400">{new Date(point.date).getDate()}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="security-card" data-testid="risk-distribution-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-red-600" />
              Risk Score Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of users by risk level categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Pie chart simulation */}
              <div className="relative h-48 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full relative overflow-hidden" style={{
                  background: `conic-gradient(
                    #ef4444 0deg ${(riskDist.high / stats?.total_users) * 360}deg,
                    #f59e0b ${(riskDist.high / stats?.total_users) * 360}deg ${((riskDist.high + riskDist.medium) / stats?.total_users) * 360}deg,
                    #10b981 ${((riskDist.high + riskDist.medium) / stats?.total_users) * 360}deg 360deg
                  )`
                }}>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{stats?.total_users}</div>
                      <div className="text-xs text-gray-500">Total Users</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">High Risk (70+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{riskDist.high}</span>
                    <Badge variant="destructive" className="text-xs">
                      {((riskDist.high / (stats?.total_users || 1)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Medium Risk (40-69)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{riskDist.medium}</span>
                    <Badge variant="secondary" className="text-xs">
                      {((riskDist.medium / (stats?.total_users || 1)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Low Risk (&lt;40)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{riskDist.low}</span>
                    <Badge variant="default" className="text-xs">
                      {((riskDist.low / (stats?.total_users || 1)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Risk Users */}
      <Card className="security-card" data-testid="top-risk-users-list">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            High-Risk Users Analysis
          </CardTitle>
          <CardDescription>
            Users requiring immediate security attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {topRisks.slice(0, 10).map((user, index) => (
              <div key={user.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    <div className="text-xs text-gray-400">{user.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={user.risk_score >= 70 ? 'destructive' : 'secondary'}
                    className="font-medium"
                  >
                    {user.risk_score}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="security-card" data-testid="security-summary">
          <CardHeader>
            <CardTitle className="text-lg">Security Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">MFA Adoption Rate</span>
              <span className="font-semibold">{stats?.mfa_percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Breach Exposure</span>
              <span className="font-semibold text-red-600">{stats?.breach_percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High Risk Users</span>
              <span className="font-semibold text-red-600">{riskDist.high}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Risk Score</span>
              <span className="font-semibold">{stats?.avg_risk_score}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="security-card" data-testid="recommendations">
          <CardHeader>
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              {stats?.mfa_percentage < 80 && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                  • Increase MFA enrollment to 90%+
                </div>
              )}
              {stats?.high_risk_users > 5 && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                  • Review {stats.high_risk_users} high-risk accounts
                </div>
              )}
              {stats?.breach_percentage > 15 && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                  • Implement breach monitoring alerts
                </div>
              )}
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                • Regular security training recommended
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="security-card" data-testid="export-options">
          <CardHeader>
            <CardTitle className="text-lg">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-10"
              onClick={() => {
                window.open(`${API}/export/csv?mfa_status=Not Enabled`, '_blank');
                toast.success('Exporting users without MFA');
              }}
              data-testid="export-no-mfa-btn"
            >
              <Download className="h-4 w-4" />
              Users without MFA
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-10"
              onClick={() => {
                window.open(`${API}/export/csv?min_risk=70`, '_blank');
                toast.success('Exporting high-risk users');
              }}
              data-testid="export-high-risk-btn"
            >
              <Download className="h-4 w-4" />
              High-risk users
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-10"
              onClick={() => {
                window.open(`${API}/export/csv`, '_blank');
                toast.success('Exporting all user data');
              }}
              data-testid="export-all-btn"
            >
              <Download className="h-4 w-4" />
              Complete dataset
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;