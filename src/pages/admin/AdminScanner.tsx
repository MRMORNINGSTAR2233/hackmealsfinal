import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, QrCode, CheckCircle, XCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const AdminScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, getParticipant, updateMealStatus } = useAppStore();
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [lastScanned, setLastScanned] = useState<{ name: string; success: boolean } | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    // Initialize scanner
    const qrScanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    qrScanner.render(onScanSuccess, onScanError);
    setScanner(qrScanner);

    return () => {
      qrScanner.clear().catch(console.error);
    };
  }, [currentUser, navigate]);

  const onScanSuccess = (decodedText: string) => {
    const participant = getParticipant(decodedText);

    if (!participant) {
      toast({
        title: 'Error',
        description: 'Participant not found',
        variant: 'destructive',
      });
      setLastScanned({ name: 'Unknown', success: false });
      return;
    }

    const success = updateMealStatus(participant.id, mealType);

    if (success) {
      toast({
        title: 'Success',
        description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} marked for ${participant.name}`,
      });
      setLastScanned({ name: participant.name, success: true });
      
      // Play success sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiDYHGGS57OWhUBELTKXh8bllHAU2jdXvz3kpBSh+zPLaizsIHGy+7+ScTBAJVqzn77BiFQU8ltrzxnMpBSp+zPDaizYGGGW77OSeUBEKTqPd8Ld0JwYufcbw3ZI+CRVht+7tplYWCkqh4PK+azAELIHO8ti');
      audio.play().catch(() => {});
    } else {
      toast({
        title: 'Warning',
        description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} already completed for ${participant.name}`,
        variant: 'destructive',
      });
      setLastScanned({ name: participant.name, success: false });
    }
  };

  const onScanError = (error: any) => {
    // Ignore continuous scanning errors
    if (error.includes('NotFoundException')) return;
    console.error(error);
  };

  const getCurrentMealTime = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 17) return 'lunch';
    return 'dinner';
  };

  useEffect(() => {
    setMealType(getCurrentMealTime());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button onClick={() => navigate('/admin/dashboard')} variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>Scan participant QR codes to mark meal attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Meal Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Meal Type</label>
              <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scanner */}
            <div id="qr-reader" className="w-full"></div>

            {/* Last Scanned */}
            {lastScanned && (
              <Card className={lastScanned.success ? 'border-green-500' : 'border-destructive'}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {lastScanned.success ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">
                        {lastScanned.success ? 'Success!' : 'Already Marked'}
                      </p>
                      <p className="text-sm text-muted-foreground">{lastScanned.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminScanner;
