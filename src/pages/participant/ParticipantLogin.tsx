import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, ArrowLeft, Users, User } from 'lucide-react';

const ParticipantLogin = () => {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifyParticipant, login } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const participant = await verifyParticipant(name.trim(), teamName.trim());

      if (participant) {
        login({ id: participant.id, role: 'participant' });
        toast({
          title: 'Welcome!',
          description: `Successfully logged in as ${participant.name}`,
        });
        navigate('/participant/dashboard');
      } else {
        toast({
          title: 'Authentication Failed',
          description: 'Please check your name and team name',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23000000%27%20fill-opacity%3D%270.1%27%3E%3Ccircle%20cx%3D%2730%27%20cy%3D%2730%27%20r%3D%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Login Card */}
        <Card className="card-premium border-0 shadow-premium-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto bg-black text-white rounded-2xl p-4 w-fit mb-6">
              <UserCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold">Participant Portal</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter your credentials to access your meal dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Your Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-premium h-12 text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Team Name Field */}
              <div className="space-y-3">
                <Label htmlFor="teamName" className="text-sm font-semibold flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Team Name
                </Label>
                <Input
                  id="teamName"
                  type="text"
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-premium h-12 text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="btn-premium w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Authenticating...
                  </div>
                ) : (
                  'Access Dashboard'
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Need help? Contact the event organizers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sample Credentials */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Sample Credentials:</strong><br />
            Name: "Your Name" | Team Name: "Team Name"
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParticipantLogin;
