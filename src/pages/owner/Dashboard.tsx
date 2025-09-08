import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Star, 
  ChefHat, 
  User, 
  LogOut, 
  Edit, 
  Trash2,
  Upload,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const OwnerDashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    mealType: "",
    price: "",
    description: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data for owner's menu items
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Idli Sambar",
      category: "veg",
      mealType: "breakfast",
      price: 25,
      description: "Soft idlis with spicy sambar and coconut chutney",
      rating: 4.3,
      reviews: 23
    },
    {
      id: 2,
      name: "Chicken Curry",
      category: "non-veg",
      mealType: "lunch",
      price: 80,
      description: "Spicy chicken curry with rice and pickle",
      rating: 4.6,
      reviews: 41
    },
    {
      id: 3,
      name: "Dal Rice",
      category: "veg",
      mealType: "lunch",
      price: 45,
      description: "Yellow dal with steamed rice and ghee",
      rating: 4.4,
      reviews: 35
    }
  ]);

  const stats = [
    { label: "Total Menu Items", value: menuItems.length, color: "primary" },
    { label: "Average Rating", value: "4.4★", color: "secondary" },
    { label: "Total Reviews", value: "99", color: "accent" },
    { label: "Today's Orders", value: "47", color: "destructive" }
  ];

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.mealType || !newItem.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const item = {
      id: Date.now(),
      ...newItem,
      price: parseInt(newItem.price),
      rating: 0,
      reviews: 0
    };

    setMenuItems([...menuItems, item]);
    setNewItem({ name: "", category: "", mealType: "", price: "", description: "" });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: "Menu item added successfully!",
    });
  };

  const handleDeleteItem = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Menu item deleted successfully!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Mess Owner Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <User className="w-4 h-4" />
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm">{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Menu Management Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Menu Management</h2>
            <Button 
              variant="hero" 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Item
            </Button>
          </div>

          {/* Add New Item Form */}
          {showAddForm && (
            <Card className="shadow-hover">
              <CardHeader>
                <CardTitle>Add New Menu Item</CardTitle>
                <CardDescription>Fill in the details for your new menu item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Chicken Biryani"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 50"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Meal Type</Label>
                    <Select value={newItem.mealType} onValueChange={(value) => setNewItem({...newItem, mealType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your dish..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="hero" onClick={handleAddItem}>
                    Add Item
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Items List */}
          <div className="grid gap-4">
            {menuItems.map((item) => (
              <Card key={item.id} className="shadow-card hover:shadow-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <Badge variant={item.category === "veg" ? "secondary" : "destructive"}>
                          {item.category === "veg" ? "Veg" : "Non-Veg"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {item.mealType}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{item.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <span className="font-semibold text-primary text-lg">₹{item.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                          <span className="text-muted-foreground">({item.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {menuItems.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No menu items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first menu item to showcase your delicious food!
                </p>
                <Button variant="hero" onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;