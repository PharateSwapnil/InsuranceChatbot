import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, User as UserIcon } from "lucide-react";
import CustomerSearch from "@/components/customer-search";
import CustomerProfile from "@/components/customer-profile";
import ChatInterface from "@/components/chat-interface";
import Sidebar from "@/components/sidebar";
import UserProfile from "@/components/user-profile";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/App";
import type { Customer } from "@shared/schema";

// Helper function to format role display text
const formatRoleDisplay = (role: string): string => {
  return "Sales Advisor";
};

interface DashboardProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function Dashboard({ user, setUser }: DashboardProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('abhi_user');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    if (isMobile) {
      setShowMobileProfile(true);
    }
    // Update chat session with customer context
    // This would be handled by the chat interface
  };

  return (
    <div className="min-h-screen bg-light-grey">
      {/* Header */}
      <header className="bg-trust-navy text-white p-4 shadow-professional-lg relative z-50">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-birla-red rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg">ABHi Assistant</h1>
              <p className="text-xs opacity-75">Aditya Birla Hybrid Insurance</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <CustomerSearch onCustomerSelect={handleCustomerSelect} />
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-white hover:bg-white/10"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-birla-red rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gold-accent rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-trust-navy" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs opacity-75">{formatRoleDisplay(user.role)}</p>
                </div>
              </div>
              
              <UserProfile user={user} />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area with margin for sidebar */}
        <div className="flex-1 ml-12 flex">
          {isMobile ? (
            // Mobile Layout
            <>
              {/* Mobile Customer Profile Overlay */}
              {showMobileProfile && selectedCustomer && (
                <div className="absolute inset-0 z-40 bg-white">
                  <div className="p-4 border-b border-soft-grey flex items-center justify-between bg-light-grey">
                    <h2 className="font-semibold text-deep-charcoal">Customer Profile</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMobileProfile(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <CustomerProfile 
                      customer={selectedCustomer} 
                      onQuickAction={(action) => {
                        setShowMobileProfile(false);
                        // This would trigger the chat action
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Mobile Chat Interface */}
              <div className="flex-1 flex flex-col">
                <ChatInterface
                  user={user}
                  selectedCustomer={selectedCustomer}
                  chatSessionId={chatSessionId}
                  setChatSessionId={setChatSessionId}
                  onShowProfile={() => setShowMobileProfile(true)}
                  isMobile={true}
                />
              </div>
            </>
          ) : (
            // Desktop Layout with Resizable Panels
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              {/* Left Panel - Customer Profile */}
              <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
                <div className="h-full bg-white border-r border-soft-grey flex flex-col">
                  <div className="p-4 border-b border-soft-grey bg-light-grey">
                    <h2 className="font-semibold text-deep-charcoal">Customer Profile</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {selectedCustomer ? (
                      <CustomerProfile 
                        customer={selectedCustomer} 
                        onQuickAction={(action) => {
                          // This would be handled by the chat interface
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <UserIcon className="w-8 h-8 text-muted-grey" />
                        </div>
                        <p className="text-muted-grey">Select a customer to view profile</p>
                        <p className="text-sm text-muted-grey mt-2">
                          Use the search bar above to find customers
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="panel-resizer" />

              {/* Right Panel - Chat Interface */}
              <ResizablePanel defaultSize={75}>
                <ChatInterface
                  user={user}
                  selectedCustomer={selectedCustomer}
                  chatSessionId={chatSessionId}
                  setChatSessionId={setChatSessionId}
                  isMobile={false}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </div>
  );
}
