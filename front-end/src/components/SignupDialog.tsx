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
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useMutation } from '@tanstack/react-query';

interface SignupDialogue {
  children: React.ReactNode;
}

const SignupDialog = ({ children }: SignupDialogue) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const { mutate: invokeSignupApi, isPending: loading} = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND}/signup`,
        { username, password }
      );
      return response.data;
    },
    onSuccess: (data: AxiosResponse) => {
      toast({
        title: "Account Created",
        description: `Congratulations, your account has been created.`,
      });
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast({
        title: "Something went wrong...",
        description: `${err.response.data.message}`,
      });
    },
  });

  const handleSignup = () => {
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    invokeSignupApi();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-panel-bg border-panel-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create your Trade Node Account</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your credentials
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
            onClick={handleSignup}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupDialog;