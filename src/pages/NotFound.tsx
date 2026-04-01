import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center text-center max-w-md animate-fade-in">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <MapPin className="h-8 w-8" />
        </div>
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-lg font-medium text-foreground">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{location.pathname}</code> doesn't exist.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link to="/dashboard">
            <Home className="h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
