import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Upload, QrCode, Users, Coffee, Utensils, Moon } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, addParticipants, getStats } = useAppStore();
  const [stats, setStats] = useState({ total: 0, breakfast: 0, lunch: 0, dinner: 0 });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    setStats(getStats());
  }, [currentUser, navigate, getStats]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a valid Excel file (.xlsx or .xls)',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      if (!workbook.SheetNames.length) {
        throw new Error('Excel file is empty');
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('No data found in Excel file');
      }

      // Normalize and validate data
      const participants = jsonData.map((row: any) => {
        // Try different column name variations
        const name = row.Name || row.name || row.NAME || row['Participant Name'];
        const teamName = row['Team Name'] || row.teamName || row.team || row.Team || row.TEAM || row['Team'];
        const mobile = String(row.Mobile || row.mobile || row.MOBILE || row.Phone || row.phone || row['Phone Number'] || '');
        const email = row.Email || row.email || row.EMAIL || '';

        return {
          name,
          teamName,
          mobile,
          email,
        };
      });

      // Check if we have any valid data
      const validParticipants = participants.filter(p => p.name && p.teamName && p.mobile);
      
      if (validParticipants.length === 0) {
        throw new Error('No valid participant data found. Please ensure columns: Name, Team Name, Mobile are present.');
      }

      const result = addParticipants(validParticipants);

      if (result.success > 0) {
        toast({
          title: 'Upload Complete',
          description: `Successfully added ${result.success} participant(s). ${result.duplicates > 0 ? `${result.duplicates} duplicate(s) skipped.` : ''} ${result.errors.length > 0 ? `${result.errors.length} error(s).` : ''}`,
        });
      }

      if (result.errors.length > 0) {
        console.error('Upload errors:', result.errors);
        toast({
          title: 'Some Errors Occurred',
          description: `${result.errors.length} row(s) had issues. Check console for details.`,
          variant: 'destructive',
        });
      }

      if (result.success === 0 && result.errors.length > 0) {
        toast({
          title: 'Upload Failed',
          description: 'No participants were added. Please check your Excel file format.',
          variant: 'destructive',
        });
      }

      setStats(getStats());
      e.target.value = ''; // Reset input
    } catch (error: any) {
      console.error('Excel upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to process Excel file. Please check the file format.',
        variant: 'destructive',
      });
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getPercentage = (count: number) => {
    return stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage participants and track meals</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => navigate('/admin/scanner')}
            className="h-20 text-lg"
            size="lg"
          >
            <QrCode className="mr-2 h-6 w-6" />
            QR Scanner
          </Button>
          <Button
            onClick={() => navigate('/admin/participants')}
            variant="secondary"
            className="h-20 text-lg"
            size="lg"
          >
            <Users className="mr-2 h-6 w-6" />
            Participants
          </Button>
          <div>
            <Button
              onClick={handleUploadClick}
              variant="outline"
              className="h-20 text-lg w-full"
              size="lg"
              disabled={uploading}
            >
              <Upload className="mr-2 h-6 w-6" />
              {uploading ? 'Uploading...' : 'Upload Excel'}
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Participants</CardDescription>
              <CardTitle className="text-4xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Breakfast Served</CardDescription>
              <CardTitle className="text-4xl">{stats.breakfast}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Coffee className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{getPercentage(stats.breakfast)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Lunch Served</CardDescription>
              <CardTitle className="text-4xl">{stats.lunch}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Utensils className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{getPercentage(stats.lunch)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Dinner Served</CardDescription>
              <CardTitle className="text-4xl">{stats.dinner}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Moon className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{getPercentage(stats.dinner)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
