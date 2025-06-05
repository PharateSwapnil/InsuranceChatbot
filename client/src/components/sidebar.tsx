import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calculator, 
  Headphones, 
  Settings,
  ChevronRight,
  Home,
  TrendingUp,
  Shield,
  User,
  Bell,
  Palette,
  Globe,
  Lock,
  Database
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState("");
  const [calculatorResult, setCalculatorResult] = useState("");
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
    language: "en",
    customerNameDisplay: false,
    dataSync: true
  });

  const navigationItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
      badge: null,
      active: true
    },
    {
      icon: Users,
      label: "Customers",
      href: "/customers", 
      badge: "100+",
      active: false
    },
    {
      icon: Shield,
      label: "Policies",
      href: "/policies",
      badge: null,
      active: false
    },
    {
      icon: TrendingUp,
      label: "Analytics",
      href: "/analytics",
      badge: "New",
      active: false
    },
    {
      icon: Calculator,
      label: "Calculator",
      href: "/calculator",
      badge: null,
      active: false
    },
    {
      icon: FileText,
      label: "Reports",
      href: "/reports",
      badge: "3",
      active: false
    },
    {
      icon: Headphones,
      label: "Support",
      href: "/support",
      badge: null,
      active: false
    }
  ];

  const quickTools = [
    {
      icon: Calculator,
      label: "Premium Calculator",
      description: "Calculate insurance premiums instantly"
    },
    {
      icon: BarChart3,
      label: "Policy Comparison",
      description: "Compare policies with competitors"
    },
    {
      icon: FileText,
      label: "Quote Generator",
      description: "Generate instant quotes for customers"
    }
  ];

  const handleCalculatorInput = (value: string) => {
    if (value === "=") {
      try {
        const result = eval(calculatorInput);
        setCalculatorResult(result.toString());
      } catch (error) {
        setCalculatorResult("Error");
      }
    } else if (value === "C") {
      setCalculatorInput("");
      setCalculatorResult("");
    } else if (value === "⌫") {
      setCalculatorInput(calculatorInput.slice(0, -1));
    } else {
      setCalculatorInput(calculatorInput + value);
    }
  };

  return (
    <div 
      className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-trust-navy transition-all duration-300 z-40 border-r-2 border-gold-accent/20 rounded-r-lg ${
        isExpanded ? 'w-64' : 'w-10'
      } ${className}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div 
        className="h-full overflow-y-auto overflow-x-hidden"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#D4AF37 transparent'
        }}
      >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-xs font-semibold text-white/75 uppercase tracking-wide mb-3">
              Navigation
            </h3>
          </div>
          
          {navigationItems.map((item, index) => (
            item.label === "Calculator" ? (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full text-white hover:bg-white/10 transition-all duration-200 ${
                      item.active ? 'bg-white/10 border-r-2 border-gold-accent' : ''
                    } ${isExpanded ? 'justify-start px-3' : 'justify-center px-2'}`}
                  >
                    <item.icon className={`flex-shrink-0 w-5 h-5 ${isExpanded ? '' : 'mx-auto'}`} />
                    <span className={`transition-all duration-300 ${
                      isExpanded ? 'ml-3 opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                    }`}>
                      {item.label}
                    </span>
                    {item.badge && isExpanded && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto bg-gold-accent text-trust-navy text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Calculator</DialogTitle>
                    <DialogDescription>
                      A simple calculator for quick calculations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="text-right text-2xl font-mono min-h-8">
                        {calculatorInput || "0"}
                      </div>
                      {calculatorResult && (
                        <div className="text-right text-lg text-gray-600 font-mono">
                          = {calculatorResult}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["C", "⌫", "/", "*"].map((btn) => (
                        <Button
                          key={btn}
                          variant="outline"
                          onClick={() => handleCalculatorInput(btn)}
                          className="h-12"
                        >
                          {btn}
                        </Button>
                      ))}
                      {["7", "8", "9", "-"].map((btn) => (
                        <Button
                          key={btn}
                          variant="outline"
                          onClick={() => handleCalculatorInput(btn)}
                          className="h-12"
                        >
                          {btn}
                        </Button>
                      ))}
                      {["4", "5", "6", "+"].map((btn) => (
                        <Button
                          key={btn}
                          variant="outline"
                          onClick={() => handleCalculatorInput(btn)}
                          className="h-12"
                        >
                          {btn}
                        </Button>
                      ))}
                      {["1", "2", "3"].map((btn) => (
                        <Button
                          key={btn}
                          variant="outline"
                          onClick={() => handleCalculatorInput(btn)}
                          className="h-12"
                        >
                          {btn}
                        </Button>
                      ))}
                      <Button
                        variant="default"
                        onClick={() => handleCalculatorInput("=")}
                        className="h-12 bg-gold-accent text-trust-navy hover:bg-gold-accent/80"
                      >
                        =
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCalculatorInput("0")}
                        className="h-12 col-span-2"
                      >
                        0
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCalculatorInput(".")}
                        className="h-12"
                      >
                        .
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                key={index}
                variant="ghost"
                className={`w-full text-white hover:bg-white/10 transition-all duration-200 ${
                  item.active ? 'bg-white/10 border-r-2 border-gold-accent' : ''
                } ${isExpanded ? 'justify-start px-3' : 'justify-center px-2'}`}
              >
                <item.icon className={`flex-shrink-0 w-5 h-5 ${isExpanded ? '' : 'mx-auto'}`} />
                <span className={`transition-all duration-300 ${
                  isExpanded ? 'ml-3 opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                }`}>
                  {item.label}
                </span>
                {item.badge && isExpanded && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto bg-gold-accent text-trust-navy text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            )
          ))}
        </nav>

        {/* Quick Tools Section */}
        {isExpanded && (
          <div className="p-4 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-semibold text-white/75 uppercase tracking-wide">
              Quick Tools
            </h3>
            
            {quickTools.map((tool, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div
                    className="group cursor-pointer p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gold-accent/20 rounded-lg flex items-center justify-center group-hover:bg-gold-accent/30 transition-colors">
                        <tool.icon className="w-4 h-4 text-gold-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {tool.label}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {tool.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{tool.label}</DialogTitle>
                    <DialogDescription>
                      {tool.description}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Premium Calculator */}
                  {tool.label === "Premium Calculator" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age">Age</Label>
                          <input
                            id="age"
                            type="number"
                            placeholder="25"
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="coverage">Coverage Amount (₹)</Label>
                          <select className="w-full p-2 border rounded-lg">
                            <option value="500000">5 Lakh</option>
                            <option value="1000000">10 Lakh</option>
                            <option value="2500000">25 Lakh</option>
                            <option value="5000000">50 Lakh</option>
                            <option value="10000000">1 Crore</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="policy-type">Policy Type</Label>
                          <select className="w-full p-2 border rounded-lg">
                            <option value="term">Term Insurance</option>
                            <option value="health">Health Insurance</option>
                            <option value="ulip">ULIP</option>
                            <option value="endowment">Endowment</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="term">Policy Term (Years)</Label>
                          <select className="w-full p-2 border rounded-lg">
                            <option value="10">10 Years</option>
                            <option value="15">15 Years</option>
                            <option value="20">20 Years</option>
                            <option value="25">25 Years</option>
                            <option value="30">30 Years</option>
                          </select>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-semibold">Estimated Premium</h4>
                        <p className="text-2xl text-green-600 font-bold">₹8,500 - ₹12,000</p>
                        <p className="text-sm text-gray-600">Annual premium estimate</p>
                      </div>
                      <Button className="w-full bg-gold-accent text-trust-navy hover:bg-gold-accent/80">
                        Get Detailed Quote
                      </Button>
                    </div>
                  )}

                  {/* Policy Comparison */}
                  {tool.label === "Policy Comparison" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Aditya Birla Policy</Label>
                          <select className="w-full p-2 border rounded-lg">
                            <option value="activ-health">Activ Health Enhanced</option>
                            <option value="protect-ease">Protect@Ease</option>
                            <option value="vision-life">Vision LifeIncome Plan</option>
                          </select>
                        </div>
                        <div>
                          <Label>Competitor Policy</Label>
                          <select className="w-full p-2 border rounded-lg">
                            <option value="icici-iprotect">ICICI iProtect Smart</option>
                            <option value="hdfc-click2protect">HDFC Click 2 Protect</option>
                            <option value="lic-tech-term">LIC Tech Term</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <h4 className="font-semibold text-green-800">Aditya Birla - Activ Health Enhanced</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            <div>Premium: ₹8,500</div>
                            <div>Coverage: ₹10L</div>
                            <div>Claim Ratio: 98.2%</div>
                            <div>Network: 6500+ hospitals</div>
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                          <h4 className="font-semibold text-blue-800">ICICI - iProtect Smart</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            <div>Premium: ₹12,000</div>
                            <div>Coverage: ₹10L</div>
                            <div>Claim Ratio: 97.8%</div>
                            <div>Network: 5000+ hospitals</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gold-accent/10 p-3 rounded-lg">
                        <p className="text-sm font-medium">🏆 Aditya Birla wins with better claim ratio and lower premium!</p>
                      </div>
                    </div>
                  )}

                  {/* Quote Generator */}
                  {tool.label === "Quote Generator" && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="customer-name">Customer Name</Label>
                          <input
                            id="customer-name"
                            type="text"
                            placeholder="Enter customer name"
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="quote-age">Age</Label>
                            <input
                              id="quote-age"
                              type="number"
                              placeholder="30"
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <Label htmlFor="quote-gender">Gender</Label>
                            <select id="quote-gender" className="w-full p-2 border rounded-lg">
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="quote-policy">Select Policy</Label>
                          <select id="quote-policy" className="w-full p-2 border rounded-lg">
                            <option value="activ-health">Activ Health Enhanced - Health</option>
                            <option value="protect-ease">Protect@Ease - Term</option>
                            <option value="vision-life">Vision LifeIncome Plan - ULIP</option>
                            <option value="child-secure">Child Secure Plan - Child</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="quote-coverage">Coverage Amount</Label>
                          <select id="quote-coverage" className="w-full p-2 border rounded-lg">
                            <option value="500000">₹5 Lakh</option>
                            <option value="1000000">₹10 Lakh</option>
                            <option value="2500000">₹25 Lakh</option>
                            <option value="5000000">₹50 Lakh</option>
                            <option value="10000000">₹1 Crore</option>
                          </select>
                        </div>
                      </div>
                      <div className="bg-trust-navy text-white p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Generated Quote</h4>
                        <div className="space-y-1 text-sm">
                          <div>Policy: Activ Health Enhanced</div>
                          <div>Coverage: ₹10,00,000</div>
                          <div>Annual Premium: ₹8,500</div>
                          <div>Policy Term: Renewable annually</div>
                          <div>Tax Benefits: Up to ₹25,000 u/s 80D</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-gold-accent text-trust-navy hover:bg-gold-accent/80">
                          Generate PDF Quote
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Email Quote
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full text-white hover:bg-white/10 transition-all duration-200 ${
                  isExpanded ? 'justify-start px-3' : 'justify-center px-2'
                }`}
              >
                <Settings className={`flex-shrink-0 w-5 h-5 ${isExpanded ? '' : 'mx-auto'}`} />
                <span className={`transition-all duration-300 ${
                  isExpanded ? 'ml-3 opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                }`}>
                  Settings
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Application Settings</DialogTitle>
                <DialogDescription>
                  Configure your application preferences and settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Appearance Settings */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance
                  </h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode" className="flex items-center gap-2">
                      Dark Mode
                    </Label>
                    <Switch
                      id="dark-mode"
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, darkMode: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, notifications: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Privacy & Data
                  </h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customer-names">Show Customer Names</Label>
                    <Switch
                      id="customer-names"
                      checked={settings.customerNameDisplay}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, customerNameDisplay: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, autoSave: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="data-sync">Data Synchronization</Label>
                    <Switch
                      id="data-sync"
                      checked={settings.dataSync}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, dataSync: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      console.log('Settings saved:', settings);
                      // Here you would typically save to backend or localStorage
                      localStorage.setItem('appSettings', JSON.stringify(settings));
                    }}
                    className="bg-gold-accent text-trust-navy hover:bg-gold-accent/80"
                  >
                    Save Settings
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSettings({
                        darkMode: false,
                        notifications: true,
                        autoSave: true,
                        language: "en",
                        customerNameDisplay: false,
                        dataSync: true
                      });
                    }}
                  >
                    Reset to Default
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {isExpanded && (
            <div className="mt-3 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-green rounded-full animate-pulse"></div>
                <span className="text-xs text-white/75">System Online</span>
              </div>
              <p className="text-xs text-white/50 mt-1">
                All services operational
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
