import React, { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Homepage from "@/pages/homepage";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('abhi_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('abhi_user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-birla-red"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="App">
          <Switch>
            <Route path="/" exact>
              <Homepage />
            </Route>
            <Route path="/login">
              {user && location === '/login' ? (
                <Dashboard user={user} setUser={setUser} />
              ) : (
                <Login setUser={setUser} />
              )}
            </Route>
            <Route path="/dashboard">
              {user ? (
                <Dashboard user={user} setUser={setUser} />
              ) : (
                <Login setUser={setUser} />
              )}
            </Route>
            <Route>
              <Homepage />
            </Route>
          </Switch>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;