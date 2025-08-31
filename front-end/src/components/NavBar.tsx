import { useState } from "react";
import { Button } from "@/components/ui/button";
import LoginDialog from "./LoginDialog";
import SignupDialog from "./SignupDialog";

interface UserData {
  username: string;
  balance: number;
}

const NavBar = () => {
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="h-14 bg-panel-bg border-b border-panel-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-bold text-primary">Trade Node</h1>
        <div className="text-sm text-muted-foreground">
          Professional Trading Platform
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="text-sm text-foreground">
              <span className="text-muted-foreground">Balance: </span>
              <span className="font-mono text-primary">
                ${user.balance.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Welcome, {user.username}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-panel-border text-foreground hover:bg-hover"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <LoginDialog isLoggedIn={false} onLogin={handleLogin}>
              <Button
                variant="default"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Login
              </Button>
            </LoginDialog>

            <SignupDialog>
              <Button
                variant="default"
                size="sm"
                className="bg-white text-primary-foreground hover:bg-white/90"
              >
                Signup
              </Button>
            </SignupDialog>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
