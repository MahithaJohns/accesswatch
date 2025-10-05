import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Globe,
  Eye,
  Users,
  Activity,
  RefreshCw,
  Clock,
  MapPin,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ThreatMonitoring = () => {
  const [threatData, setThreatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchThreatData = async (showToast = false) => {
    try {
      setRefreshing(true);
      
      const response = await fetch(`${API}/security/organization-threat-summary`);
      if (response.ok) {
        const data = await response.json();
        setThreatData(data);
        
        if (showToast) {
          toast.success('Threat monitoring data refreshed');
        }
      } else {
        toast.error('Failed to fetch threat monitoring data');
      }
    } catch (error) {
      console.error('Error fetching threat data:', error);
      toast.error('Error loading threat monitoring data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThreatData();
  }, []);

  const handleRefresh = () => {
    fetchThreatData(true);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'LOW': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Threat Monitoring</h1>
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
    <div className="space-y-6" data-testid="threat-monitoring-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Threat Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor malicious website usage and security threats across the organization</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="gap-2"
            data-testid="refresh-threats-btn"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {threatData && threatData.summary.users_with_detections > 0 && (
        <Card className="border-red-200 bg-red-50" data-testid="threat-alert-banner">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-red-900 mb-2">Security Alert: Company Emails Detected on Malicious Websites</div>
                <div className="text-sm text-red-800">
                  {threatData.summary.users_with_detections} users have been detected using company email addresses on {threatData.summary.total_threats_detected} potentially malicious websites. 
                  {threatData.risk_distribution.high_risk > 0 && (
                    <span className="font-medium"> {threatData.risk_distribution.high_risk} users are at high risk and require immediate attention.</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {threatData && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="security-card hover-lift" data-testid="total-monitored-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Users Monitored</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{threatData.summary.total_users_monitored}</div>
              <p className="text-xs text-gray-500 mt-1">Active email addresses tracked</p>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="threats-detected-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Threats Detected</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{threatData.summary.total_threats_detected}</div>
              <p className="text-xs text-gray-500 mt-1">Malicious websites found</p>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="affected-users-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Affected Users</CardTitle>
              <Activity className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{threatData.summary.users_with_detections}</div>
              <p className="text-xs text-gray-500 mt-1">
                {((threatData.summary.users_with_detections / threatData.summary.total_users_monitored) * 100).toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>

          <Card className="security-card hover-lift" data-testid="high-risk-users-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">High Risk Users</CardTitle>
              <Shield className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{threatData.risk_distribution.high_risk}</div>
              <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Threat Categories */}
        <Card className="security-card" data-testid="threat-categories-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-red-600" />
              Threat Categories
            </CardTitle>
            <CardDescription>
              Breakdown of detected threat types
            </CardDescription>
          </CardHeader>
          <CardContent>
            {threatData && (
              <div className="space-y-4">
                {Object.entries(threatData.summary.threat_categories).map(([category, count]) => {
                  const percentage = (count / threatData.summary.total_threats_detected) * 100;
                  const categoryColors = {
                    phishing: 'bg-red-500',
                    malware: 'bg-purple-500',
                    scam: 'bg-orange-500',
                    data_breach: 'bg-pink-500',
                    suspicious: 'bg-yellow-500'
                  };
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${categoryColors[category]}`}></div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${categoryColors[category]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="security-card" data-testid="risk-distribution-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              Risk Distribution
            </CardTitle>
            <CardDescription>
              User risk levels across the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {threatData && (
              <div className="space-y-4">
                <div className="relative h-32 w-32 mx-auto">
                  <div className="w-32 h-32 rounded-full relative overflow-hidden" style={{
                    background: `conic-gradient(
                      #ef4444 0deg ${(threatData.risk_distribution.high_risk / threatData.summary.total_users_monitored) * 360}deg,
                      #f97316 ${(threatData.risk_distribution.high_risk / threatData.summary.total_users_monitored) * 360}deg ${((threatData.risk_distribution.high_risk + threatData.risk_distribution.medium_risk) / threatData.summary.total_users_monitored) * 360}deg,
                      #10b981 ${((threatData.risk_distribution.high_risk + threatData.risk_distribution.medium_risk) / threatData.summary.total_users_monitored) * 360}deg 360deg
                    )`
                  }}>
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{threatData.summary.total_users_monitored}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{threatData.risk_distribution.high_risk}</span>
                      <Badge variant="destructive" className="text-xs">
                        {((threatData.risk_distribution.high_risk / threatData.summary.total_users_monitored) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{threatData.risk_distribution.medium_risk}</span>
                      <Badge variant="secondary" className="text-xs">
                        {((threatData.risk_distribution.medium_risk / threatData.summary.total_users_monitored) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Low Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{threatData.risk_distribution.low_risk}</span>
                      <Badge variant="default" className="text-xs">
                        {((threatData.risk_distribution.low_risk / threatData.summary.total_users_monitored) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Threat Domains */}
      <Card className="security-card" data-testid="top-threats-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Top Threat Domains
          </CardTitle>
          <CardDescription>
            Most frequently detected malicious websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threatData && (
            <div className="space-y-4">
              {threatData.top_threat_domains.map((domain, index) => (
                <div key={domain.domain} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">{domain.domain}</div>
                      <div className="text-xs text-gray-500">{domain.detections} detections across organization</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={domain.risk_score >= 90 ? 'destructive' : 'secondary'}
                      className="font-medium"
                    >
                      Risk: {domain.risk_score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Threats */}
      <Card className="security-card" data-testid="recent-threats-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Threat Activity
          </CardTitle>
          <CardDescription>
            Latest security threats detected across the organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threatData && (
            <div className="space-y-4">
              {threatData.recent_threats.map((threat, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getRiskColor(threat.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{threat.threat}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {threat.affected_users} users affected • Detected {new Date(threat.detected_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge 
                      variant={threat.severity === 'HIGH' ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {threat.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatMonitoring;