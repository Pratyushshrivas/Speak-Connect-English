import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="h-8 w-8 rounded-md bg-gradient-primary shadow-glow" aria-hidden />
          <span>SpeakConnect</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <NavLink to="/learn" className={({isActive}) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>Learn</NavLink>
          <NavLink to="/speak" className={({isActive}) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>Speak</NavLink>
          <NavLink to="/leaderboard" className={({isActive}) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>Leaderboard</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className={({isActive}) => isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}>Profile</NavLink>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild variant="hero" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;