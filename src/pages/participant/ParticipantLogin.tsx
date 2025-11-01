import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle } from 'lucide-react';

const ParticipantLogin = () => {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifyParticipant, login } = useAppStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const participant = verifyParticipant(name.trim(), teamName.trim());

    if (participant) {
      login({ id: participant.id, role: 'participant' });
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      navigate('/participant/dashboard');
    } else {
      toast({
        title: 'Error',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <UserCircle className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Participant Portal</CardTitle>
          <CardDescription className="text-center">
            Enter your details to view your QR code and meal status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Username (Your Name)</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamName">Password (Team Name)</Label>
              <Input
                id="teamName"
                type="text"
                placeholder="Team Alpha"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantLogin;
