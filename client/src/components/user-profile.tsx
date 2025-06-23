import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, UserExemption } from "@shared/schema";
import { User as UserIcon, Shield, Calendar, DollarSign } from "lucide-react";
import type { User as AppUser } from "@/App";

interface UserProfileProps {
  user: AppUser;
}

interface UserProfileData {
  user: User;
  exemptions: UserExemption[];
}

export default function UserProfile({ user }: UserProfileProps) {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/profile`, {
        credentials: 'include' // Include cookies for session
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else if (response.status === 401) {
        console.error("Authentication failed - please log in again");
      } else {
        console.error("Failed to fetch user profile:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchUserProfile();
    }
  }, [user.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCertificationBadgeColor = (type: string) => {
    const colors = {
      'POSP': 'bg-blue-100 text-blue-800',
      'IRDAI Agent': 'bg-green-100 text-green-800',
      'Corporate Agent': 'bg-purple-100 text-purple-800',
      'Group Insurance': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <UserIcon className="w-4 h-4 mr-2" />
          Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>Sales Advisor Profile</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-navy"></div>
          </div>
        ) : profileData ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-grey">Name</p>
                    <p className="text-deep-charcoal">{profileData.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-grey">Username</p>
                    <p className="text-deep-charcoal">{profileData.user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-grey">Email</p>
                    <p className="text-deep-charcoal">{profileData.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-grey">Role</p>
                    <Badge className="bg-trust-navy text-white">
                      {profileData.user.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-grey">Level</p>
                    <Badge className="bg-emerald-green text-white">
                      {profileData.user.level || 'Not Assigned'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-grey">User ID</p>
                    <p className="text-xs text-deep-charcoal font-mono">{profileData.user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-grey">Created At</p>
                    <p className="text-deep-charcoal">{formatDate(profileData.user.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sales Exemptions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Sales Exemptions & Limits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.exemptions.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.exemptions.map((exemption) => (
                      <div key={exemption.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-deep-charcoal">{exemption.product_type}</h4>
                            <Badge className={getCertificationBadgeColor(exemption.certification_type)}>
                              {exemption.certification_type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-green">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">{formatCurrency(exemption.exemption_limit)}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-grey">Sales Limit (No Underwriting)</p>
                            <p className="font-medium text-deep-charcoal">{formatCurrency(exemption.exemption_limit)}</p>
                          </div>
                          <div>
                            <p className="text-muted-grey">Valid Until</p>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-muted-grey" />
                              <p className="text-deep-charcoal">{formatDate(exemption.valid_till)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-muted-grey">
                          <p>Last Updated: {formatDate(exemption.updated_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-grey">
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No sales exemptions found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Underwriting Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Underwriting Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Sales Within Limits</h5>
                  <p className="text-sm text-blue-800">
                    You can sell policies up to your exemption limits without requiring customer medicals or full underwriting. 
                    These are processed instantly as pre-approved products.
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-medium text-orange-900 mb-2">Sales Above Limits</h5>
                  <p className="text-sm text-orange-800">
                    For policies exceeding your exemption limits, full underwriting is required including:
                  </p>
                  <ul className="text-sm text-orange-800 mt-2 ml-4 list-disc">
                    <li>Customer medical examination</li>
                    <li>Financial documentation</li>
                    <li>Underwriter approval</li>
                    <li>Extended processing time (7-14 days)</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">Best Practices</h5>
                  <ul className="text-sm text-green-800 list-disc ml-4 space-y-1">
                    <li>Focus on products within your exemption limits for faster processing</li>
                    <li>Clearly explain underwriting requirements for higher coverage amounts</li>
                    <li>Maintain certification validity to retain exemption privileges</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-grey">
            <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Failed to load profile data</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}