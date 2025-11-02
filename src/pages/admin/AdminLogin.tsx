import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Shield, User, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifyAdmin, login } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await verifyAdmin(username, password);

    if (isValid) {
      login({ id: username, role: 'admin' });
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: 'Error',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card-premium">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-black text-white rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black mb-2">Admin Portal</h1>
            <p className="text-muted-foreground text-lg">
              Secure access to administrative dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Administrator Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Button type="submit" className="btn-premium w-full h-12 text-lg">
                <LogIn className="mr-2 h-5 w-5" />
                Access Admin Dashboard
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/')}
              >
                ← Back to Home
              </Button>
            </div>
          </form>

          {/* Sample Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">Sample Credentials for Testing:</p>
            <div className="text-xs text-center space-y-1">
              <p><span className="font-mono bg-white px-2 py-1 rounded">admin</span> / <span className="font-mono bg-white px-2 py-1 rounded">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
