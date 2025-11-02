import { useEffect, useState, useCallback } from 'react';
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
  const { currentUser, getParticipant, updateMealStatus, loadParticipants } = useAppStore();
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [lastScanned, setLastScanned] = useState<{ name: string; success: boolean } | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onScanSuccess = useCallback(async (decodedText: string) => {
    // Prevent rapid successive scans
    if (isProcessing) return;
    setIsProcessing(true);

    console.log('🔍 QR Scanned:', decodedText);
    console.log('🎯 Meal Type:', mealType);
    
    const participant = await getParticipant(decodedText);
    console.log('👤 Participant found:', participant);

    if (!participant) {
      console.error('❌ Participant not found for QR:', decodedText);
      toast({
        title: 'Participant Not Found',
        description: 'This QR code is not registered in the system',
        variant: 'destructive',
      });
      setLastScanned({ name: 'Unknown', success: false });
      setTimeout(() => setIsProcessing(false), 2000);
      return;
    }

    console.log('📊 Current meal status:', {
      breakfast: participant.breakfast,
      lunch: participant.lunch,
      dinner: participant.dinner
    });

    // Check if meal is already completed before attempting to update
    if (participant[mealType]) {
      console.log('⚠️ Meal already completed:', mealType);
      toast({
        title: 'Already Scanned',
        description: `${participant.name} has already been scanned for ${mealType}`,
        variant: 'destructive',
      });
      setLastScanned({ name: participant.name, success: false });
      setTimeout(() => setIsProcessing(false), 2000);
      return;
    }

    const success = await updateMealStatus(participant.id, mealType);
    console.log('💾 Update result:', success);

    if (success) {
      console.log('✅ Meal status updated successfully');
      toast({
        title: 'Success',
        description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} marked for ${participant.name}`,
      });
      setLastScanned({ name: participant.name, success: true });
      
      // Play success sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiDYHGGS57OWhUBELTKXh8bllHAU2jdXvz3kpBSh+zPLaizsIHGy+7+ScTBAJVqzn77BiFQU8ltrzxnMpBSp+zPDaizYGGGW77OSeUBEKTqPd8Ld0JwYufcbw3ZI+CRVht+7tplYWCkqh4PK+azAELIHO8ti');
      audio.play().catch(() => {});
    } else {
      console.log('⚠️ Meal status not updated - unexpected error');
      toast({
        title: 'Error',
        description: `Failed to update ${mealType} status for ${participant.name}`,
        variant: 'destructive',
      });
      setLastScanned({ name: participant.name, success: false });
    }
    
    // Reset processing state after 2 seconds
    setTimeout(() => setIsProcessing(false), 2000);
  }, [mealType, getParticipant, updateMealStatus, toast, isProcessing]);

  const onScanError = useCallback((error: unknown) => {
    // Ignore continuous scanning errors
    if (error && typeof error === 'string' && error.includes('NotFoundException')) return;
    console.error(error);
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    // Load participants to ensure we have latest data
    loadParticipants();
  }, [currentUser, navigate, loadParticipants]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
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
  }, [currentUser, onScanSuccess, onScanError]);

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
              <Select value={mealType} onValueChange={(value: 'breakfast' | 'lunch' | 'dinner') => setMealType(value)}>
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
            <div className="relative">
              <div id="qr-reader" className="w-full"></div>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="bg-white p-4 rounded-lg flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="text-sm font-medium">Processing scan...</span>
                  </div>
                </div>
              )}
            </div>

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
