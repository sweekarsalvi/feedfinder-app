import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mealFilter, setMealFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [messes, setMesses] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchMesses();

    // Subscribe to real-time updates for messes
    const messesChannel = supabase
      .channel('messes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messes'
        },
        () => {
          fetchMesses();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for menus
    const menusChannel = supabase
      .channel('menus-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menus'
        },
        () => {
          fetchMesses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messesChannel);
      supabase.removeChannel(menusChannel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth/login?role=student");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", session.user.id)
      .single();

    if (!profile || profile.role !== "student") {
      await supabase.auth.signOut();
      navigate("/auth/login?role=student");
      return;
    }

    setUserId(profile.id);
    fetchFavorites(profile.id);
  };

  const fetchMesses = async () => {
    const { data: messesData, error: messesError } = await supabase
      .from("messes")
      .select("*")
      .eq("is_active", true)
      .eq("is_verified", true);

    if (messesError || !messesData) {
      console.error("Error fetching messes:", messesError);
      return;
    }

    // Fetch menus for all messes
    const { data: menusData, error: menusError } = await supabase
      .from("menus")
      .select("*")
      .eq("is_available", true);

    if (menusError) {
      console.error("Error fetching menus:", menusError);
    }

    // Group menus by mess_id and meal_type
    const menusByMess: Record<string, { breakfast: any[], lunch: any[], dinner: any[] }> = {};
    
    menusData?.forEach(menu => {
      if (!menusByMess[menu.mess_id]) {
        menusByMess[menu.mess_id] = { breakfast: [], lunch: [], dinner: [] };
      }
      
      const items = Array.isArray(menu.items) ? menu.items : [];
      const mealType = menu.meal_type as 'breakfast' | 'lunch' | 'dinner';
      
      menusByMess[menu.mess_id][mealType] = items.map((item: any) => ({
        ...item,
        price: menu.price || item.price || 0,
        rating: item.rating || 4.0
      }));
    });

    // Combine messes with their menus
    setMesses(messesData.map(mess => ({
      id: mess.id,
      name: mess.name,
      location: mess.address,
      rating: 4.5,
      menu: menusByMess[mess.id] || { breakfast: [], lunch: [], dinner: [] }
    })));
  };

  const fetchFavorites = async (profileId: string) => {
    const { data, error } = await supabase
      .from("favorites")
      .select("mess_id")
      .eq("user_id", profileId);

    if (!error && data) {
      setFavorites(data.map(f => f.mess_id));
    }
  };

  const toggleFavorite = async (messId: any) => {
    if (!userId) return;

    const isFavorite = favorites.includes(messId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("mess_id", messId);

      if (!error) {
        setFavorites(favorites.filter(id => id !== messId));
        toast({
          title: "Removed from favorites",
          description: "Mess removed from your favorites",
        });
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, mess_id: messId });

      if (!error) {
        setFavorites([...favorites, messId]);
        toast({
          title: "Added to favorites",
          description: "Mess added to your favorites",
        });
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

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
              onClick={handleLogout}
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
                      {favorites.includes(mess.id) && (
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
                    variant={favorites.includes(mess.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFavorite(mess.id)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${favorites.includes(mess.id) ? 'fill-current' : ''}`} />
                    {favorites.includes(mess.id) ? "Favorited" : "Add to Favorites"}
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