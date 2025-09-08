import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ChefHat, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroFood from "@/assets/hero-food.jpg";

const Home = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Student",
      description: "View daily menus, rate meals, and bookmark your favorite messes",
      icon: Users,
      path: "/student/dashboard",
      color: "primary"
    },
    {
      title: "Mess Owner",
      description: "Upload and manage daily menus, view ratings and reviews",
      icon: ChefHat,
      path: "/owner/dashboard",
      color: "secondary"
    },
    {
      title: "Admin",
      description: "Verify mess owners, manage users, and monitor platform activity",
      icon: Shield,
      path: "/admin/dashboard",
      color: "accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Campus Mess
                  <span className="block bg-gradient-primary bg-clip-text text-transparent">
                    Management
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Connect students with delicious meals, help mess owners showcase their food, 
                  and enable admins to maintain quality across campus dining.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" onClick={() => navigate("/auth/login")}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-3xl blur-xl"></div>
              <img 
                src={heroFood} 
                alt="Delicious mess food varieties" 
                className="relative z-10 w-full rounded-3xl shadow-hover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select your role to access features tailored to your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.title} 
                  className="relative group cursor-pointer transition-all duration-300 hover:shadow-hover border-2 hover:border-primary"
                  onClick={() => navigate(role.path)}
                >
                  <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">{role.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base leading-relaxed">
                      {role.description}
                    </CardDescription>
                    <Button 
                      variant="role" 
                      className="mt-6 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(role.path);
                      }}
                    >
                      Enter as {role.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for campus dining management with features that matter
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Menus",
                description: "Get instant updates on daily menus and meal availability",
                icon: "🍽️"
              },
              {
                title: "Rating System",
                description: "Rate and review meals to help improve dining quality",
                icon: "⭐"
              },
              {
                title: "Easy Management",
                description: "Mess owners can easily upload and manage their daily offerings",
                icon: "📱"
              },
              {
                title: "Quality Control",
                description: "Admin oversight ensures high standards across all messes",
                icon: "✅"
              },
              {
                title: "Favorites",
                description: "Bookmark your favorite messes and never miss their specials",
                icon: "❤️"
              },
              {
                title: "Notifications",
                description: "Get notified about new menus, offers, and updates",
                icon: "🔔"
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-hover transition-all duration-300">
                <CardHeader>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;