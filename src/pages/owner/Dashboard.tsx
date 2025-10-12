import { useState, useEffect } from "react";
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
  Trash2,
  Upload,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const OwnerDashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [mess, setMess] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    mealType: "",
    price: "",
    description: ""
  });
  const [newMess, setNewMess] = useState({
    name: "",
    address: "",
    description: "",
    email: "",
    phone: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth/login?role=mess_owner");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile || profile.role !== "mess_owner") {
      await supabase.auth.signOut();
      navigate("/auth/login?role=mess_owner");
      return;
    }

    setProfileId(profile.id);
    await fetchMess(profile.id);
  };

  const fetchMess = async (ownerId: string) => {
    const { data: messData, error } = await supabase
      .from("messes")
      .select("*")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching mess:", error);
      return;
    }

    if (messData) {
      setMess(messData);
      await fetchMenus(messData.id);
      await fetchOrders(messData.id);
      await fetchReviews(messData.id);
    }
  };

  const fetchMenus = async (messId: string) => {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("mess_id", messId)
      .eq("date", new Date().toISOString().split("T")[0])
      .order("meal_type", { ascending: true });

    if (error) {
      console.error("Error fetching menus:", error);
      return;
    }

    // Flatten menu items from all meals
    const allItems = data?.flatMap(menu => 
      (menu.items as any[]).map(item => ({
        ...item,
        mealType: menu.meal_type,
        menuId: menu.id
      }))
    ) || [];

    setMenuItems(allItems);
  };

  const fetchOrders = async (messId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        profiles!orders_student_id_fkey (
          full_name,
          email
        )
      `)
      .eq("mess_id", messId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    setOrders(data || []);

    // Subscribe to real-time updates for orders
    const ordersChannel = supabase
      .channel('owner-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders(messId);
        }
      )
      .subscribe();
  };

  const fetchReviews = async (messId: string) => {
    // Get all menu IDs for this mess
    const { data: menuData } = await supabase
      .from("menus")
      .select("id")
      .eq("mess_id", messId);

    if (!menuData || menuData.length === 0) {
      setReviews([]);
      return;
    }

    const menuIds = menuData.map(m => m.id);

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles!reviews_reviewer_id_fkey (
          full_name,
          email
        ),
        menus!reviews_menu_id_fkey (
          meal_type,
          date
        )
      `)
      .in("menu_id", menuIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return;
    }

    setReviews(data || []);

    // Subscribe to real-time updates for reviews
    const reviewsChannel = supabase
      .channel('owner-reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          fetchReviews(messId);
        }
      )
      .subscribe();
  };

  const handleApproveOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "approved" })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve order. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order Approved",
      description: "Order has been approved successfully.",
    });

    if (mess) {
      fetchOrders(mess.id);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "rejected" })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject order. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order Rejected",
      description: "Order has been rejected.",
      variant: "destructive",
    });

    if (mess) {
      fetchOrders(mess.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCreateMess = async () => {
    if (!newMess.name || !newMess.address || !profileId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("messes")
      .insert({
        owner_id: profileId,
        name: newMess.name,
        address: newMess.address,
        description: newMess.description,
        email: newMess.email,
        phone: newMess.phone,
        is_active: true,
        is_verified: false
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create mess. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating mess:", error);
      return;
    }

    setMess(data);
    setNewMess({ name: "", address: "", description: "", email: "", phone: "" });
    
    toast({
      title: "Success",
      description: "Mess created! Waiting for admin approval to be visible to students.",
    });
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.mealType || !newItem.price || !mess) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    
    // Check if menu exists for this meal type today
    const { data: existingMenu } = await supabase
      .from("menus")
      .select("*")
      .eq("mess_id", mess.id)
      .eq("meal_type", newItem.mealType)
      .eq("date", today)
      .maybeSingle();

    const newMenuItem = {
      name: newItem.name,
      category: newItem.category,
      price: parseInt(newItem.price),
      rating: 0
    };

    if (existingMenu) {
      // Update existing menu by adding item
      const updatedItems = [...(existingMenu.items as any[]), newMenuItem];
      
      const { error } = await supabase
        .from("menus")
        .update({ items: updatedItems })
        .eq("id", existingMenu.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add menu item.",
          variant: "destructive",
        });
        console.error("Error updating menu:", error);
        return;
      }
    } else {
      // Create new menu
      const { error } = await supabase
        .from("menus")
        .insert({
          mess_id: mess.id,
          meal_type: newItem.mealType,
          date: today,
          items: [newMenuItem],
          price: parseInt(newItem.price),
          is_available: true
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create menu.",
          variant: "destructive",
        });
        console.error("Error creating menu:", error);
        return;
      }
    }

    await fetchMenus(mess.id);
    setNewItem({ name: "", category: "", mealType: "", price: "", description: "" });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: "Menu item added successfully!",
    });
  };

  const handleDeleteItem = async (item: any) => {
    if (!mess) return;

    const today = new Date().toISOString().split("T")[0];
    
    const { data: menu } = await supabase
      .from("menus")
      .select("*")
      .eq("mess_id", mess.id)
      .eq("meal_type", item.mealType)
      .eq("date", today)
      .maybeSingle();

    if (!menu) return;

    const updatedItems = (menu.items as any[]).filter(i => i.name !== item.name);
    
    if (updatedItems.length === 0) {
      // Delete menu if no items left
      await supabase
        .from("menus")
        .delete()
        .eq("id", menu.id);
    } else {
      // Update menu with remaining items
      await supabase
        .from("menus")
        .update({ items: updatedItems })
        .eq("id", menu.id);
    }

    await fetchMenus(mess.id);
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
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Show mess creation form if no mess exists */}
        {!mess ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create Your Mess</CardTitle>
              <CardDescription>Fill in your mess details to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="messName">Mess Name *</Label>
                <Input
                  id="messName"
                  placeholder="e.g., Annapurna Mess"
                  value={newMess.name}
                  onChange={(e) => setNewMess({...newMess, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="e.g., Near Main Gate, Campus Road"
                  value={newMess.address}
                  onChange={(e) => setNewMess({...newMess, address: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="messDescription">Description</Label>
                <Textarea
                  id="messDescription"
                  placeholder="Describe your mess..."
                  value={newMess.description}
                  onChange={(e) => setNewMess({...newMess, description: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="messEmail">Email</Label>
                  <Input
                    id="messEmail"
                    type="email"
                    placeholder="mess@example.com"
                    value={newMess.email}
                    onChange={(e) => setNewMess({...newMess, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messPhone">Phone</Label>
                  <Input
                    id="messPhone"
                    type="tel"
                    placeholder="+91-9876543210"
                    value={newMess.phone}
                    onChange={(e) => setNewMess({...newMess, phone: e.target.value})}
                  />
                </div>
              </div>

              <Button variant="hero" onClick={handleCreateMess} className="w-full">
                Create Mess
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mess Status Banner */}
            {!mess.is_verified && (
              <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Your mess is pending admin approval. You can add menu items, but they won't be visible to students until approved.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardDescription className="text-sm">Status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={mess.is_verified ? "secondary" : "destructive"}>
                    {mess.is_verified ? "Verified" : "Pending"}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardDescription className="text-sm">Total Menu Items</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{menuItems.length}</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardDescription className="text-sm">Mess Name</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{mess.name}</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardDescription className="text-sm">Location</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{mess.address}</p>
                </CardContent>
              </Card>
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
                      <Label htmlFor="description">Description (Optional)</Label>
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
                {menuItems.map((item, index) => (
                  <Card key={index} className="shadow-card hover:shadow-hover transition-all duration-300">
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
                          
                          <div className="flex items-center gap-6 text-sm mt-3">
                            <span className="font-semibold text-primary text-lg">₹{item.price}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{item.rating || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteItem(item)}
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

            {/* Orders Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Orders from students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{order.profiles?.full_name || "Unknown Student"}</h4>
                          <Badge>{order.meal_type}</Badge>
                          <Badge variant={
                            order.status === "approved" ? "secondary" : 
                            order.status === "rejected" ? "destructive" : 
                            "outline"
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.profiles?.email} • Ordered on {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      {order.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleApproveOrder(order.id)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRejectOrder(order.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                      <p className="text-muted-foreground">Orders from students will appear here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Customer Reviews
                </CardTitle>
                <CardDescription>Feedback from students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{review.profiles?.full_name || "Unknown Student"}</h4>
                          <Badge variant="outline">{review.menus?.meal_type}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  
                  {reviews.length === 0 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                      <p className="text-muted-foreground">Customer reviews will appear here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
