import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatusDot } from "@/components/StatusDot";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/services/api";
import { User, Moon, Sun, Bell, Wifi, Info, Pencil, Check, X } from "lucide-react";

const SettingsPage: React.FC = () => {
  const { user, userLoading } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [fullName, setFullName] = useState("");
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  useEffect(() => {
    api
      .get("/health")
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  };

  const handleSaveName = () => {
    toast.info("Profile update endpoint not yet available");
    setEditingName(false);
  };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const roleBadgeVariant =
    user?.role === "admin" ? "destructive" : user?.role === "manager" ? "default" : "secondary";

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title="Settings" subtitle="Manage your profile and application preferences" />

        {/* Section 1: User Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">User Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="h-20 w-20 text-xl">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveName}>
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { setEditingName(false); setFullName(user?.full_name || ""); }}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{user?.full_name || "—"}</p>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingName(true)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="text-sm text-foreground">{user?.email || "—"}</p>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Role</Label>
                  <div>
                    <Badge variant={roleBadgeVariant} className="capitalize">
                      {user?.role || "—"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Application Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Application Settings</CardTitle>
            </div>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            <Separator />

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive assessment and gap alerts via email</p>
                </div>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Browser push notifications for urgent updates</p>
                </div>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>

            <Separator />

            {/* API Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">API Connection</p>
                  <p className="text-xs text-muted-foreground">{apiBaseUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot
                  variant={apiStatus === "online" ? "success" : apiStatus === "offline" ? "danger" : "neutral"}
                  pulse={apiStatus === "checking"}
                />
                <span className="text-xs font-medium capitalize text-muted-foreground">{apiStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: About */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">About</CardTitle>
            </div>
            <CardDescription>Application information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium text-foreground">1.0.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Backend API</p>
                <p className="font-medium text-foreground break-all">{apiBaseUrl}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Tech Stack</p>
                <p className="font-medium text-foreground">React · TypeScript · Tailwind CSS · Vite</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
