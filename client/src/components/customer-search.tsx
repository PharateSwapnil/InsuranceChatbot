import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, User, Phone, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@shared/schema";

interface CustomerSearchProps {
  onCustomerSelect: (customer: Customer) => void;
}

export default function CustomerSearch({ onCustomerSelect }: CustomerSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch search results
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers/search", query],
    enabled: query.length > 0,
    queryFn: async () => {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json() as Promise<Customer[]>;
    },
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('abhi_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomerSelect = (customer: Customer) => {
    setQuery("");
    setIsOpen(false);
    onCustomerSelect(customer);
    
    // Add to recent searches
    const newRecentSearches = [
      customer.name,
      ...recentSearches.filter(search => search !== customer.name)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('abhi_recent_searches', JSON.stringify(newRecentSearches));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0 || recentSearches.length > 0);
  };

  const handleInputFocus = () => {
    setIsOpen(query.length > 0 || recentSearches.length > 0);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-grey" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search customers by name, phone, email, or ID..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-black placeholder-muted-grey focus:ring-2 focus:ring-gold-accent border-0"
        />
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-soft-grey shadow-professional-lg max-h-64 overflow-y-auto z-50"
        >
          {query.length > 0 ? (
            // Search Results
            <div>
              {isLoading ? (
                <div className="p-3 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : customers.length > 0 ? (
                <div>
                  {customers.map((customer) => {
                    const existingPolicies = JSON.parse(customer.existing_policies || "[]");
                    const adityaBirlaPolicies = existingPolicies.filter(
                      (policy: any) => policy.provider === "Aditya Birla"
                    );
                    
                    return (
                      <div
                        key={customer.id}
                        className="p-3 hover:bg-light-grey cursor-pointer border-b border-soft-grey last:border-b-0 transition-colors"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-birla-red rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-deep-charcoal truncate">
                              {customer.name}
                            </h4>
                            <div className="flex items-center space-x-4 text-xs text-muted-grey">
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{customer.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{customer.city}</span>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="text-xs text-azure-blue">
                                {existingPolicies.length} policies
                              </span>
                              {adityaBirlaPolicies.length > 0 && (
                                <span className="text-xs text-emerald-green">
                                  • {adityaBirlaPolicies.length} with us
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center text-muted-grey">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No customers found</p>
                  <p className="text-xs mt-1">Try searching with name, phone, email, or customer ID</p>
                </div>
              )}
            </div>
          ) : recentSearches.length > 0 ? (
            // Recent Searches
            <div>
              <div className="p-3 border-b border-soft-grey">
                <p className="text-xs font-medium text-muted-grey uppercase tracking-wide">
                  Recent Searches
                </p>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-light-grey cursor-pointer border-b border-soft-grey last:border-b-0 transition-colors"
                  onClick={() => setQuery(search)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Search className="w-4 h-4 text-muted-grey" />
                    </div>
                    <span className="text-deep-charcoal">{search}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
