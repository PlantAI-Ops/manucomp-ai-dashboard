import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "@/services/api";
import { cn } from "@/lib/utils";

const strengthLevels = [
  { label: "Weak", color: "bg-destructive", min: 0 },
  { label: "Fair", color: "bg-warning", min: 1 },
  { label: "Good", color: "bg-warning", min: 2 },
  { label: "Strong", color: "bg-success", min: 3 },
];

function getStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const strength = getStrength(password);
  const canSubmit =
    fullName.trim().length > 0 &&
    isValidEmail &&
    password.length >= 8 &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      toast({ title: "Account created successfully", description: "Please sign in." });
      navigate("/login");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err.response?.data?.detail || "Email already registered",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-lg font-semibold text-center mb-1">Create Account</h2>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Full Name</Label>
          <Input
            placeholder="Jane Rivera"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-muted/50 border-border/50 rounded-input"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Email</Label>
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-muted/50 border-border/50 rounded-input"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-muted/50 border-border/50 rounded-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="space-y-1 animate-fade-in">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-200",
                      i < strength ? strengthLevels[Math.min(strength - 1, 3)].color : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {strengthLevels[Math.min(Math.max(strength - 1, 0), 3)].label}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-muted/50 border-border/50 rounded-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass">
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity rounded-input active:scale-[0.98]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
