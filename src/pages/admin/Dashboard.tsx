import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  ChefHat, 
  Star, 
  TrendingUp,
  Search,
  Check,
  X,
  AlertTriangle,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data for admin overview
  const stats = [
    { 
      label: "Total Students", 
      value: "1,234", 
      icon: Users, 
      change: "+12%",
      color: "primary" 
    },
    { 
      label: "Active Messes", 
      value: "15", 
      icon: ChefHat, 
      change: "+2",
      color: "secondary" 
    },
    { 
      label: "Average Rating", 
      value: "4.3★", 
      icon: Star, 
      change: "+0.2",
      color: "accent" 
    },
    { 
      label: "Daily Orders", 
      value: "892", 
      icon: TrendingUp, 
      change: "+5%",
      color: "destructive" 
    }
  ];

  const [pendingOwners, setPendingOwners] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh@email.com",
      messName: "Spice Garden",
      location: "Block C",
      documentsSubmitted: true,
      appliedDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@email.com",
      messName: "Healthy Bites",
      location: "Block D",
      documentsSubmitted: false,
      appliedDate: "2024-01-14"
    }
  ]);

  const recentReports = [
    {
      id: 1,
      type: "Food Quality",
      messName: "Sunrise Mess",
      reportedBy: "Student #1234",
      severity: "medium",
      date: "2024-01-15",
      status: "pending"
    },
    {
      id: 2,
      type: "Hygiene Issue",
      messName: "Tasty Bites",
      reportedBy: "Student #5678",
      severity: "high",
      date: "2024-01-14",
      status: "resolved"
    }
  ];

  const handleApproveOwner = (id: number) => {
    setPendingOwners(pendingOwners.filter(owner => owner.id !== id));
    toast({
      title: "Owner Approved",
      description: "Mess owner has been approved and can now start uploading menus.",
    });
  };

  const handleRejectOwner = (id: number) => {
    setPendingOwners(pendingOwners.filter(owner => owner.id !== id));
    toast({
      title: "Owner Rejected",
      description: "Application has been rejected and user has been notified.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <UserIcon className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-card hover:shadow-hover transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-sm font-medium">
                    {stat.label}
                  </CardDescription>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "New mess owner 'Spice Garden' applied for verification",
                    "Student reported food quality issue at 'Sunrise Mess'",
                    "Mess owner 'Tasty Bites' uploaded new dinner menu",
                    "'Healthy Kitchen' received 5-star rating from 10 students"
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                      <p className="text-muted-foreground">{activity}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Rated Messes</CardTitle>
                  <CardDescription>Best performing messes this week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Sunrise Mess", rating: 4.8, orders: 156 },
                    { name: "Spice Garden", rating: 4.6, orders: 142 },
                    { name: "Healthy Kitchen", rating: 4.5, orders: 128 },
                    { name: "Tasty Bites", rating: 4.4, orders: 119 }
                  ].map((mess, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{mess.name}</p>
                        <p className="text-sm text-muted-foreground">{mess.orders} orders</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{mess.rating}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Mess Owner Approvals</CardTitle>
                <CardDescription>Review and approve new mess owner applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingOwners.map((owner) => (
                    <div key={owner.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{owner.name}</h4>
                          <Badge variant="outline">{owner.messName}</Badge>
                          <Badge variant={owner.documentsSubmitted ? "secondary" : "destructive"}>
                            {owner.documentsSubmitted ? "Documents Complete" : "Documents Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {owner.email} • {owner.location} • Applied on {owner.appliedDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleApproveOwner(owner.id)}
                          disabled={!owner.documentsSubmitted}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRejectOwner(owner.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingOwners.length === 0 && (
                    <div className="text-center py-8">
                      <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                      <p className="text-muted-foreground">No pending approvals at the moment.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Student reports and feedback that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-4 h-4 ${
                            report.severity === "high" ? "text-red-500" : 
                            report.severity === "medium" ? "text-yellow-500" : "text-green-500"
                          }`} />
                          <h4 className="font-semibold">{report.type}</h4>
                          <Badge variant="outline">{report.messName}</Badge>
                          <Badge variant={report.status === "resolved" ? "secondary" : "destructive"}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reported by {report.reportedBy} on {report.date}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage students, mess owners, and other users</CardDescription>
                  </div>
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground">
                    Advanced user management features coming soon. You can view user statistics in the overview tab.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;