import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Heart, 
  Star, 
  Clock, 
  MapPin, 
  User,
  LogOut,
  Utensils
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mealFilter, setMealFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const navigate = useNavigate();

  // Mock data for messes and menus
  const messes = [
    {
      id: 1,
      name: "Sunrise Mess",
      location: "Block A",
      rating: 4.5,
      isFavorite: true,
      menu: {
        breakfast: [
          { name: "Idli Sambar", category: "veg", price: 25, rating: 4.3 },
          { name: "Poha", category: "veg", price: 20, rating: 4.1 }
        ],
        lunch: [
          { name: "Dal Rice", category: "veg", price: 45, rating: 4.4 },
          { name: "Chicken Curry", category: "non-veg", price: 80, rating: 4.6 }
        ],
        dinner: [
          { name: "Chapati Sabzi", category: "veg", price: 40, rating: 4.2 },
          { name: "Fish Curry", category: "non-veg", price: 85, rating: 4.5 }
        ]
      }
    },
    {
      id: 2,
      name: "Tasty Bites",
      location: "Block B",
      rating: 4.2,
      isFavorite: false,
      menu: {
        breakfast: [
          { name: "Dosa", category: "veg", price: 30, rating: 4.4 },
          { name: "Upma", category: "veg", price: 18, rating: 3.9 }
        ],
        lunch: [
          { name: "Rajma Rice", category: "veg", price: 50, rating: 4.3 },
          { name: "Egg Curry", category: "non-veg", price: 60, rating: 4.1 }
        ],
        dinner: [
          { name: "Paratha", category: "veg", price: 35, rating: 4.0 },
          { name: "Mutton Curry", category: "non-veg", price: 120, rating: 4.7 }
        ]
      }
    }
  ];

  const getCurrentMealTime = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "breakfast";
    if (hour < 16) return "lunch";
    return "dinner";
  };

  const filteredMesses = messes.filter(mess => {
    const matchesSearch = mess.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const renderMealItems = (meals: any[], mealType: string) => {
    if (!meals) return null;
    
    const filteredMeals = meals.filter(meal => {
      const matchesMeal = mealFilter === "all" || mealFilter === mealType;
      const matchesCategory = categoryFilter === "all" || meal.category === categoryFilter;
      return matchesMeal && matchesCategory;
    });

    if (filteredMeals.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-lg capitalize flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          {mealType}
        </h4>
        <div className="grid gap-3">
          {filteredMeals.map((meal, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium">{meal.name}</h5>
                  <Badge variant={meal.category === "veg" ? "secondary" : "destructive"}>
                    {meal.category === "veg" ? "Veg" : "Non-Veg"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">₹{meal.price}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{meal.rating}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Rate
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Student Dashboard</h1>
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
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search messes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={mealFilter} onValueChange={setMealFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Meal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meals</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Meal Highlight */}
        <div className="mb-8">
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Current Meal Time: {getCurrentMealTime().charAt(0).toUpperCase() + getCurrentMealTime().slice(1)}
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Check out what's available for {getCurrentMealTime()} across campus
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Messes Grid */}
        <div className="grid gap-6">
          {filteredMesses.map((mess) => (
            <Card key={mess.id} className="shadow-card hover:shadow-hover transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {mess.name}
                      {mess.isFavorite && (
                        <Heart className="w-4 h-4 fill-accent text-accent" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {mess.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {mess.rating}
                      </div>
                    </CardDescription>
                  </div>
                  
                  <Button 
                    variant={mess.isFavorite ? "accent" : "outline"}
                    size="sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {mess.isFavorite ? "Favorited" : "Add to Favorites"}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {renderMealItems(mess.menu.breakfast, "breakfast")}
                {renderMealItems(mess.menu.lunch, "lunch")}
                {renderMealItems(mess.menu.dinner, "dinner")}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No messes found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;