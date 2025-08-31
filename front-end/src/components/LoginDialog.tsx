import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LoginDialogProps {
  isLoggedIn: boolean;
  onLogin: (userData: { username: string; balance: number }) => void;
  children: React.ReactNode;
}

const LoginDialog = ({ isLoggedIn, onLogin, children }: LoginDialogProps) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate login API call
    setTimeout(() => {
      // Mock successful login
      onLogin({
        username,
        balance: 50000.00 // Mock balance
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      });
      
      setOpen(false);
      setUsername('');
      setPassword('');
      setLoading(false);
    }, 1000);
  };

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-panel-bg border-panel-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Login to Trade Node</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your credentials to access your trading account
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-foreground">Username</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="border-panel-border text-foreground hover:bg-hover"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogin}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;