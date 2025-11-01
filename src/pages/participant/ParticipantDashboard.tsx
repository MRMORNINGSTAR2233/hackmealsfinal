import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, RefreshCw, Download, CheckCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ParticipantDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout, participants } = useAppStore();
  const [participant, setParticipant] = useState<any>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'participant') {
      navigate('/participant/login');
      return;
    }

    const p = participants.find(p => p.id === currentUser.id);
    if (!p) {
      logout();
      navigate('/participant/login');
      return;
    }

    setParticipant(p);
  }, [currentUser, navigate, participants, logout]);

  const handleLogout = () => {
    logout();
    navigate('/participant/login');
  };

  const handleRefresh = () => {
    const p = participants.find(p => p.id === currentUser?.id);
    setParticipant(p);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {participant.name}</h1>
            <p className="text-muted-foreground">{participant.teamName}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your registration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{participant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="font-medium">{participant.mobile}</p>
              </div>
              {participant.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{participant.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="font-medium">{participant.teamName}</p>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your QR Code</CardTitle>
              <CardDescription>Show this at meal counters</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  id="qr-code"
                  value={participant.qrCode}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <Button onClick={handleDownloadQR} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Meal Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Meal Status</CardTitle>
            <CardDescription>Your meal attendance record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border-2 ${participant.breakfast ? 'border-green-500 bg-green-50' : 'border-muted bg-muted/20'}`}>
                <div className="flex items-center gap-3">
                  {participant.breakfast ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold">Breakfast</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.breakfast ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${participant.lunch ? 'border-green-500 bg-green-50' : 'border-muted bg-muted/20'}`}>
                <div className="flex items-center gap-3">
                  {participant.lunch ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold">Lunch</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.lunch ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${participant.dinner ? 'border-green-500 bg-green-50' : 'border-muted bg-muted/20'}`}>
                <div className="flex items-center gap-3">
                  {participant.dinner ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold">Dinner</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.dinner ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
