import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Upload, QrCode, Users, Coffee, Utensils, Moon, Shield, FileSpreadsheet, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout, addParticipants, getStats, loadParticipants, isLoading } = useAppStore();
  const [stats, setStats] = useState({ total: 0, breakfast: 0, lunch: 0, dinner: 0 });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    // Load participants and update stats
    const initializeData = async () => {
      await loadParticipants();
      setStats(getStats());
    };
    
    initializeData();
  }, [currentUser, navigate, getStats, loadParticipants]);

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

      // Define type for Excel row data
      type ExcelRow = Record<string, string | number | undefined>;

      // Normalize and validate data
      const participants = jsonData.map((row: ExcelRow) => {
        // Try different column name variations
        const name = String(row.Name || row.name || row.NAME || row['Participant Name'] || '');
        const teamName = String(row['Team Name'] || row.teamName || row.team || row.Team || row.TEAM || row['Team'] || '');
        const mobile = String(row.Mobile || row.mobile || row.MOBILE || row.Phone || row.phone || row['Phone Number'] || '');
        const email = String(row.Email || row.email || row.EMAIL || '');

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

      const result = await addParticipants(validParticipants);

      if (result.success > 0) {
        toast({
          title: 'Upload Complete',
          description: `Successfully added ${result.success} participant(s). ${result.duplicates > 0 ? `${result.duplicates} duplicate(s) skipped.` : ''} ${result.errors.length > 0 ? `${result.errors.length} error(s).` : ''}`,
        });
        
        // Update stats after successful upload
        setStats(getStats());
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
    } catch (error: unknown) {
      console.error('Excel upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to process Excel file. Please check the file format.',
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
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl p-2">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage participants and track meals</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="hover:bg-primary hover:text-white transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h2 className="text-4xl font-black mb-2">Command Center</h2>
          <p className="text-muted-foreground text-lg">
            Monitor meal distribution and manage participants
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium group cursor-pointer" onClick={() => navigate('/admin/scanner')}>
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">QR Scanner</h3>
                <p className="text-muted-foreground">Scan participant QR codes to mark meals</p>
              </div>
            </div>
          </div>

          <div className="card-premium group cursor-pointer" onClick={() => navigate('/admin/participants')}>
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-primary/80 to-primary/60 text-white rounded-2xl p-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Participants</h3>
                <p className="text-muted-foreground">View and manage all registered participants</p>
              </div>
            </div>
          </div>

          <div className="card-premium group">
            <div className="text-center space-y-4">
              <div 
                className="bg-gradient-to-br from-primary/60 to-primary/40 text-white rounded-2xl p-6 w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer"
                onClick={handleUploadClick}
              >
                <FileSpreadsheet className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Upload Excel</h3>
                <p className="text-muted-foreground mb-4">Import participant data from spreadsheet</p>
                <Button 
                  onClick={handleUploadClick}
                  variant="outline"
                  disabled={uploading}
                  className="w-full hover:bg-primary hover:text-white transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
            </div>
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
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl p-2">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-bold">Statistics Overview</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-premium text-center">
              <div className="mb-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Total Participants</h4>
                <p className="text-4xl font-black">{stats.total}</p>
              </div>
            </div>

            <div className="card-premium text-center">
              <div className="mb-4">
                <div className="bg-gradient-to-br from-primary/80 to-primary/60 text-white rounded-2xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <Coffee className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Breakfast Served</h4>
                <p className="text-4xl font-black">{stats.breakfast}</p>
                <p className="text-sm text-muted-foreground">{getPercentage(stats.breakfast)}% completion</p>
              </div>
            </div>

            <div className="card-premium text-center">
              <div className="mb-4">
                <div className="bg-gradient-to-br from-primary/60 to-primary/40 text-white rounded-2xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <Utensils className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Lunch Served</h4>
                <p className="text-4xl font-black">{stats.lunch}</p>
                <p className="text-sm text-muted-foreground">{getPercentage(stats.lunch)}% completion</p>
              </div>
            </div>

            <div className="card-premium text-center">
              <div className="mb-4">
                <div className="bg-gradient-to-br from-primary/40 to-primary/20 text-black rounded-2xl p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <Moon className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Dinner Served</h4>
                <p className="text-4xl font-black">{stats.dinner}</p>
                <p className="text-sm text-muted-foreground">{getPercentage(stats.dinner)}% completion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            📊 Dashboard updates in real-time • Last refreshed: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
