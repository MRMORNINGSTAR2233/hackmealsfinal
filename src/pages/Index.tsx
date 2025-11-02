import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle, Shield, Utensils, QrCode, BarChart3, Users, Zap, Crown } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/hackotsav-logo.png" 
                alt="HackOtsav 2025" 
                className="h-10 w-10 rounded-xl object-contain"
              />
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  HackOtsav 2025
                </span>
                <p className="text-xs text-muted-foreground">Meal Tracker</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Official Feast Management
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
              <Crown className="h-4 w-4 mr-2" />
              HackOtsav 2025 Official Platform
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black tracking-tight">
              Hackathon
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Feast Tracker
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Professional meal management system designed for modern hackathons. 
              Streamline food distribution with QR codes, real-time analytics, and elegant participant tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Button 
                className="btn-premium text-lg px-8 py-4 h-auto"
                onClick={() => navigate('/admin/login')}
              >
                <Shield className="mr-2 h-5 w-5" />
                Admin Access
              </Button>
              <Button 
                variant="outline" 
                className="btn-premium-outline text-lg px-8 py-4 h-auto"
                onClick={() => navigate('/participant/login')}
              >
                <UserCircle className="mr-2 h-5 w-5" />
                Participant Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Excellence</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to manage meals at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Admin Portal Card */}
            <div 
              className="card-premium group cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/admin/login')}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Admin Control Center</h3>
                  <p className="text-muted-foreground mb-6">
                    Complete management dashboard with advanced analytics and real-time monitoring
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <QrCode className="h-4 w-4 mr-3 text-primary" />
                      High-speed QR scanning system
                    </div>
                    <div className="flex items-center text-sm">
                      <BarChart3 className="h-4 w-4 mr-3 text-primary" />
                      Real-time consumption analytics
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-3 text-primary" />
                      Bulk participant management
                    </div>
                    <div className="flex items-center text-sm">
                      <Utensils className="h-4 w-4 mr-3 text-primary" />
                      Multi-meal tracking (B/L/D)
                    </div>
                  </div>

                  <Button className="btn-premium w-full mt-6">
                    Access Admin Portal
                  </Button>
                </div>
              </div>
            </div>

            {/* Participant Portal Card */}
            <div 
              className="card-premium group cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/participant/login')}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-primary/80 to-primary/60 text-white rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                  <UserCircle className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Participant Experience</h3>
                  <p className="text-muted-foreground mb-6">
                    Seamless self-service portal with instant QR access and meal tracking
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <QrCode className="h-4 w-4 mr-3 text-primary" />
                      Personal QR code generation
                    </div>
                    <div className="flex items-center text-sm">
                      <BarChart3 className="h-4 w-4 mr-3 text-primary" />
                      Live meal status updates
                    </div>
                    <div className="flex items-center text-sm">
                      <UserCircle className="h-4 w-4 mr-3 text-primary" />
                      Personal dashboard & profile
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap className="h-4 w-4 mr-3 text-primary" />
                      Instant status synchronization
                    </div>
                  </div>

                  <Button variant="outline" className="btn-premium-outline w-full mt-6">
                    Enter Participant Portal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-black rounded-xl p-2">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">HackMeal Feast Tracker</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Professional Hackathon Solutions
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
