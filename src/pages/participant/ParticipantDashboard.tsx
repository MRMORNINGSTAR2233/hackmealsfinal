import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, Participant } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, RefreshCw, Download, CheckCircle, Clock, UserCircle, User, Users, Phone, Mail } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ParticipantDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout, participants, loadParticipants } = useAppStore();
  const [participant, setParticipant] = useState<Participant | null>(null);

  // Auto-refresh participant data every 30 seconds to show updated meal status
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'participant') return;

    const interval = setInterval(() => {
      loadParticipants().then(() => {
        const latest = useAppStore.getState().participants as Participant[];
        const p = latest.find((pp: Participant) => pp.id === currentUser.id);
        if (p) {
          setParticipant(p);
        }
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, loadParticipants]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'participant') {
      navigate('/participant/login');
      return;
    }

    let mounted = true;

    const ensureParticipantLoaded = async () => {
      // Try to find locally first
      let p = participants.find(p => p.id === currentUser.id);
      if (p) {
        if (mounted) setParticipant(p);
        return;
      }

      // If not found, attempt to load participants from backend once and re-check
      try {
        await loadParticipants();
      } catch (e) {
        // ignore - loadParticipants handles its own errors
      }

      // Read latest participants from the store and try again
  const latest = useAppStore.getState().participants as Participant[];
  p = latest.find((pp: Participant) => pp.id === currentUser.id);
      if (p) {
        if (mounted) setParticipant(p);
        return;
      }

      // Still not found -> logout and redirect to login
      if (mounted) {
        logout();
        navigate('/participant/login');
      }
    };

    ensureParticipantLoaded();

    return () => {
      mounted = false;
    };
  }, [currentUser, navigate, participants, logout, loadParticipants]);

  const handleLogout = () => {
    logout();
    navigate('/participant/login');
  };

  const handleRefresh = async () => {
    // Reload participants from backend to get latest meal status
    await loadParticipants();
    
    // Find updated participant data
    const latest = useAppStore.getState().participants as Participant[];
    const p = latest.find((pp: Participant) => pp.id === currentUser?.id);
    if (p) {
      setParticipant(p);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${participant?.name}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!participant) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl p-2">
                <UserCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{participant.name}</h1>
                <p className="text-sm text-muted-foreground">{participant.teamName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                className="hover:bg-primary hover:text-white transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="hover:bg-primary hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-5xl space-y-8">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h2 className="text-4xl font-black mb-2">Welcome Back!</h2>
          <p className="text-muted-foreground text-lg">
            Here's your meal dashboard and QR code
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="card-premium text-center">
            <h3 className="text-2xl font-bold mb-6">Your QR Code</h3>
            <div className="qr-container mx-auto w-fit mb-6">
              <QRCodeSVG
                id="qr-code"
                value={participant.qrCode}
                size={220}
                level="H"
                includeMargin
                className="rounded-xl"
              />
            </div>
            <p className="text-muted-foreground mb-6">
              Show this QR code at meal counters
            </p>
            <Button 
              onClick={handleDownloadQR} 
              className="btn-premium w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>

          {/* Profile Info */}
          <div className="card-premium">
            <h3 className="text-2xl font-bold mb-6">Profile Information</h3>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-muted/50 rounded-xl">
                <User className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{participant.name}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-muted/50 rounded-xl">
                <Users className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Team</p>
                  <p className="font-semibold">{participant.teamName}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-muted/50 rounded-xl">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-semibold">{participant.mobile}</p>
                </div>
              </div>
              
              {participant.email && (
                <div className="flex items-center p-4 bg-muted/50 rounded-xl">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{participant.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meal Status */}
        <div className="card-premium">
          <h3 className="text-2xl font-bold mb-6">Meal Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Breakfast */}
            <div className={`meal-card p-6 text-center ${participant.breakfast ? 'meal-card-completed' : 'meal-card-pending'}`}>
              <div className="flex flex-col items-center space-y-4">
                <div className={`rounded-2xl p-4 ${participant.breakfast ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {participant.breakfast ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Clock className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold">Breakfast</h4>
                  <p className={`text-sm font-medium ${participant.breakfast ? 'text-green-600' : 'text-gray-500'}`}>
                    {participant.breakfast ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Lunch */}
            <div className={`meal-card p-6 text-center ${participant.lunch ? 'meal-card-completed' : 'meal-card-pending'}`}>
              <div className="flex flex-col items-center space-y-4">
                <div className={`rounded-2xl p-4 ${participant.lunch ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {participant.lunch ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Clock className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold">Lunch</h4>
                  <p className={`text-sm font-medium ${participant.lunch ? 'text-green-600' : 'text-gray-500'}`}>
                    {participant.lunch ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dinner */}
            <div className={`meal-card p-6 text-center ${participant.dinner ? 'meal-card-completed' : 'meal-card-pending'}`}>
              <div className="flex flex-col items-center space-y-4">
                <div className={`rounded-2xl p-4 ${participant.dinner ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {participant.dinner ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Clock className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold">Dinner</h4>
                  <p className={`text-sm font-medium ${participant.dinner ? 'text-green-600' : 'text-gray-500'}`}>
                    {participant.dinner ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-refresh Info */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            📱 Dashboard auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
