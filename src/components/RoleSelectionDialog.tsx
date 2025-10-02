import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, ChefHat, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoleSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoleSelectionDialog = ({ open, onOpenChange }: RoleSelectionDialogProps) => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Student",
      value: "student",
      description: "View menus and rate meals",
      icon: Users,
    },
    {
      title: "Mess Owner",
      value: "mess_owner",
      description: "Manage your mess menus",
      icon: ChefHat,
    },
    {
      title: "Admin",
      value: "admin",
      description: "Platform administration",
      icon: Shield,
    },
  ];

  const handleRoleSelect = (role: string) => {
    onOpenChange(false);
    navigate(`/auth/login?role=${role}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center bg-gradient-primary bg-clip-text text-transparent">
            Select Your Role
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose how you'd like to access the platform
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Button
                key={role.value}
                variant="outline"
                className="h-auto p-4 flex items-start gap-4 hover:border-primary transition-all"
                onClick={() => handleRoleSelect(role.value)}
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">{role.title}</div>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionDialog;
