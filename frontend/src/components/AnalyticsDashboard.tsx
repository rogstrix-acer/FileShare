'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Eye, 
  Share2, 
  Calendar, 
  TrendingUp, 
  Users,
  FileText,
  Clock,
  ExternalLink,
  Copy,
  Trash2
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ShareAnalytics {
  id: string;
  fileId: string;
  fileName: string;
  shareToken: string;
  downloadCount: number;
  maxDownloads?: number;
  expiresAt?: string;
  createdAt: string;
  isExpired: boolean;
  isLimitReached: boolean;
  dailyDownloads: Array<{
    date: string;
    downloads: number;
  }>;
}

interface AnalyticsOverview {
  totalShares: number;
  totalDownloads: number;
  activeShares: number;
  expiredShares: number;
  topFiles: Array<{
    fileName: string;
    downloads: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [shares, setShares] = useState<ShareAnalytics[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // This would be implemented in the backend
      const response = await apiClient.getUserShares();
      if (response.success && response.data) {
        // Mock data for demonstration - replace with actual API call
        const mockShares: ShareAnalytics[] = response.data.shares?.map((share: any) => ({
          id: share.id,
          fileId: share.fileId,
          fileName: `File_${share.fileId.slice(0, 8)}.pdf`,
          shareToken: share.shareToken,
          downloadCount: share.downloadCount || Math.floor(Math.random() * 50),
          maxDownloads: share.maxDownloads,
          expiresAt: share.expiresAt,
          createdAt: share.createdAt,
          isExpired: share.expiresAt ? new Date(share.expiresAt) < new Date() : false,
          isLimitReached: share.maxDownloads ? share.downloadCount >= share.maxDownloads : false,
          dailyDownloads: generateMockDailyData()
        })) || [];

        setShares(mockShares);
        
        // Calculate overview
        const totalDownloads = mockShares.reduce((sum, share) => sum + share.downloadCount, 0);
        const activeShares = mockShares.filter(share => !share.isExpired && !share.isLimitReached).length;
        const expiredShares = mockShares.filter(share => share.isExpired || share.isLimitReached).length;
        
        setOverview({
          totalShares: mockShares.length,
          totalDownloads,
          activeShares,
          expiredShares,
          topFiles: mockShares
            .sort((a, b) => b.downloadCount - a.downloadCount)
            .slice(0, 5)
            .map(share => ({
              fileName: share.fileName,
              downloads: share.downloadCount
            }))
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDailyData = () => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        downloads: Math.floor(Math.random() * 10)
      };
    });
  };

  const copyShareLink = async (shareToken: string) => {
    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    await navigator.clipboard.writeText(shareUrl);
    // You could add a toast notification here
  };

  const deleteShare = async (shareToken: string) => {
    if (confirm('Are you sure you want to delete this share link?')) {
      try {
        // Implement delete share API call
        await fetchAnalytics(); // Refresh data
      } catch (error) {
        console.error('Failed to delete share:', error);
      }
    }
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalShares}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.activeShares} active
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalDownloads}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% from last week
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Shares</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{overview.activeShares}</div>
                <p className="text-xs text-muted-foreground">
                  Currently accessible
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired/Limited</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overview.expiredShares}</div>
                <p className="text-xs text-muted-foreground">
                  No longer accessible
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shares">Share Management</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button
              variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('7d')}
            >
              7 days
            </Button>
            <Button
              variant={selectedTimeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('30d')}
            >
              30 days
            </Button>
            <Button
              variant={selectedTimeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('90d')}
            >
              90 days
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Download Trends</CardTitle>
                <CardDescription>Daily downloads over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={shares[0]?.dailyDownloads || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="downloads" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Files</CardTitle>
                <CardDescription>Most downloaded files</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overview?.topFiles || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fileName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="downloads" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shares" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Share Management</CardTitle>
              <CardDescription>Manage your active and expired share links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shares.map((share) => (
                  <motion.div
                    key={share.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{share.fileName}</span>
                        {share.isExpired && <Badge variant="destructive">Expired</Badge>}
                        {share.isLimitReached && <Badge variant="warning">Limit Reached</Badge>}
                        {!share.isExpired && !share.isLimitReached && <Badge variant="success">Active</Badge>}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {share.downloadCount} downloads
                        {share.maxDownloads && ` / ${share.maxDownloads} max`}
                        {share.expiresAt && ` • Expires ${new Date(share.expiresAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShareLink(share.shareToken)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/share/${share.shareToken}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteShare(share.shareToken)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Share Status Distribution</CardTitle>
                <CardDescription>Breakdown of share statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: overview?.activeShares || 0 },
                        { name: 'Expired', value: overview?.expiredShares || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {[
                        { name: 'Active', value: overview?.activeShares || 0 },
                        { name: 'Expired', value: overview?.expiredShares || 0 }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Download Performance</CardTitle>
                <CardDescription>Downloads per share comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={shares.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fileName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="downloadCount" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}