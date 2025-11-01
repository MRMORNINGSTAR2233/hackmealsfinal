import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Shield, Utensils } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Utensils className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Hackathon Feast Tracker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Efficient meal tracking system for hackathon participants and organizers
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Admin Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/login')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
              <CardDescription>
                Manage participants, scan QR codes, and track meal distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => navigate('/admin/login')}>
                Admin Login
              </Button>
              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p>✓ Upload participant data</p>
                <p>✓ QR code scanning</p>
                <p>✓ Real-time statistics</p>
                <p>✓ Participant management</p>
              </div>
            </CardContent>
          </Card>

          {/* Participant Portal */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/participant/login')}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <UserCircle className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Participant Portal</CardTitle>
              <CardDescription>
                View your QR code and check your meal attendance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" variant="secondary" onClick={() => navigate('/participant/login')}>
                Participant Login
              </Button>
              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p>✓ Access your QR code</p>
                <p>✓ View meal status</p>
                <p>✓ Download QR code</p>
                <p>✓ Real-time updates</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Default Admin Credentials:</strong> username: admin | password: admin123
              </p>
              <p className="text-xs text-muted-foreground">
                Participants login using their Name and Team Name
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
