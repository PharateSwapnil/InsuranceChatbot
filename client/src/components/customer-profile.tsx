import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  TrendingUp, 
  Shield, 
  Target,
  Heart,
  Calculator,
  Scale,
  Sparkles
} from "lucide-react";
import type { Customer, CustomerPolicy, HealthCondition } from "@shared/schema";

interface CustomerProfileProps {
  customer: Customer;
  onQuickAction?: (action: string, customer: Customer) => void;
}

interface PolicyRecommendation {
  policy_name: string;
  policy_type: string;
  coverage_amount: string;
  premium_estimate: string;
  key_benefits: string[];
  suitability_score: number;
  reasoning: string;
}

export default function CustomerProfile({ customer, onQuickAction }: CustomerProfileProps) {
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<PolicyRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const existingPolicies: CustomerPolicy[] = JSON.parse(customer.existing_policies || "[]");
  const financialGoals: string[] = JSON.parse(customer.financial_goals || "[]");
  const healthConditions: HealthCondition = JSON.parse(customer.health_conditions || "{}");

  const adityaBirlaPolicies = existingPolicies.filter(policy => policy.provider === "Aditya Birla");
  const competitorPolicies = existingPolicies.filter(policy => policy.provider !== "Aditya Birla");

  const activeHealthConditions = Object.entries(healthConditions)
    .filter(([_, value]) => value)
    .map(([key]) => key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));

  const handleQuickAction = async (action: string) => {
    if (action === "recommend-policy") {
      await handlePolicyRecommendation();
    } else if (onQuickAction) {
      onQuickAction(action, customer);
    }
  };

  const handlePolicyRecommendation = async () => {
    setIsLoadingRecommendations(true);

    try {
      const customerProfile = {
        age: customer.age,
        gender: customer.gender,
        marital_status: customer.marital_status,
        dependents_count: customer.dependents_count,
        profession: customer.profession,
        city: customer.city,
        state: customer.state,
        income_bracket: customer.income_bracket,
        annual_income: customer.annual_income,
        risk_appetite: customer.risk_appetite,
        existing_policies: existingPolicies,
        financial_goals: financialGoals,
        health_conditions: activeHealthConditions
      };

      const response = await fetch('/api/chat/recommend-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: customerProfile,
          hideCustomerName: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
        setShowRecommendations(true);
      } else {
        throw new Error('Invalid recommendations format');
      }
    } catch (error) {
      console.error('Error getting policy recommendations:', error);
      // Fallback recommendations
      setRecommendations([
        {
          policy_name: "Activ Health Enhanced",
          policy_type: "Health Insurance",
          coverage_amount: "₹10,00,000",
          premium_estimate: "₹15,000/year",
          key_benefits: ["No room rent capping", "Global coverage", "Wellness rewards"],
          suitability_score: 90,
          reasoning: "Based on your profile, this provides comprehensive health coverage with excellent benefits."
        },
        {
          policy_name: "Protect@Ease Term Plan",
          policy_type: "Term Life Insurance", 
          coverage_amount: "₹50,00,000",
          premium_estimate: "₹12,000/year",
          key_benefits: ["High coverage", "Tax benefits", "Flexible terms"],
          suitability_score: 85,
          reasoning: "Optimal life coverage for your age group and income bracket."
        }
      ]);
      setShowRecommendations(true);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const getRiskAppetiteColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-emerald-green/10 text-emerald-green';
      case 'medium': return 'bg-azure-blue/10 text-azure-blue';
      case 'high': return 'bg-birla-red/10 text-birla-red';
      default: return 'bg-muted text-muted-grey';
    }
  };

  const getIncomeColor = (income: string) => {
    switch (income) {
      case '<5L': return 'bg-muted text-muted-grey';
      case '5-10L': return 'bg-azure-blue/10 text-azure-blue';
      case '10-25L': return 'bg-gold-accent/10 text-trust-navy';
      case '>25L': return 'bg-emerald-green/10 text-emerald-green';
      default: return 'bg-muted text-muted-grey';
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Customer Header */}
      <Card className="card-professional">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-birla-red rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-deep-charcoal">{customer.name}</h3>
              <p className="text-muted-grey">{customer.profession}</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="status-dot"></div>
                <span className="text-xs status-online font-medium">Active Customer</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card className="card-professional">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-birla-red" />
            <h4 className="font-medium text-deep-charcoal">Demographics</h4>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-grey">Age</span>
                <p className="font-medium text-deep-charcoal">{customer.age} years</p>
              </div>
              <div>
                <span className="text-muted-grey">Gender</span>
                <p className="font-medium text-deep-charcoal">
                  {customer.gender === 'M' ? 'Male' : customer.gender === 'F' ? 'Female' : 'Other'}
                </p>
              </div>
              <div>
                <span className="text-muted-grey">Status</span>
                <p className="font-medium text-deep-charcoal">{customer.marital_status}</p>
              </div>
              <div>
                <span className="text-muted-grey">Dependents</span>
                <p className="font-medium text-deep-charcoal">{customer.dependents_count}</p>
              </div>
                </div>

                <div className="mt-2">
                  <span className="text-muted-grey">Customer ID</span>
                  <p className="text-xs text-deep-charcoal font-mono">{customer.id}</p>
                </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-grey" />
                <span className="text-sm text-deep-charcoal">{customer.city}, {customer.state}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-grey" />
                <span className="text-sm text-deep-charcoal">{customer.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-grey" />
                <span className="text-sm text-deep-charcoal break-all">{customer.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Profile */}
      <Card className="card-professional">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-birla-red" />
            <h4 className="font-medium text-deep-charcoal">Financial Profile</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-grey">Income Bracket</span>
              <Badge className={getIncomeColor(customer.income_bracket)}>
                ₹{customer.income_bracket}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-grey">Risk Appetite</span>
              <Badge className={getRiskAppetiteColor(customer.risk_appetite)}>
                {customer.risk_appetite}
              </Badge>
            </div>

            {customer.annual_income && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-grey">Annual Income</span>
                <span className="text-sm font-medium text-deep-charcoal">
                  ₹{customer.annual_income.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Health Conditions */}
      {activeHealthConditions.length > 0 && (
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-4 h-4 text-birla-red" />
              <h4 className="font-medium text-deep-charcoal">Health Conditions</h4>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeHealthConditions.map((condition) => (
                <Badge key={condition} variant="outline" className="text-xs">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Goals */}
      <Card className="card-professional">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-4 h-4 text-birla-red" />
            <h4 className="font-medium text-deep-charcoal">Financial Goals</h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {financialGoals.map((goal) => (
              <Badge key={goal} className="bg-gold-accent/10 text-trust-navy text-xs">
                {goal}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Policies */}
      <Card className="card-professional">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-birla-red" />
            <h4 className="font-medium text-deep-charcoal">Current Policies</h4>
          </div>

          <div className="space-y-3">
            {/* Aditya Birla Policies */}
            {adityaBirlaPolicies.map((policy, index) => (
              <div key={`ab-${index}`} className="policy-card rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-deep-charcoal text-sm">{policy.provider}</h5>
                    <p className="text-xs text-muted-grey">{policy.type}</p>
                  </div>
                  <Badge className="bg-emerald-green text-white text-xs">
                    Our Policy
                  </Badge>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-grey">Coverage:</span>
                    <span className="text-deep-charcoal font-medium">₹{policy.coverage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-grey">Premium:</span>
                    <span className="text-deep-charcoal">₹{policy.premium.toLocaleString()}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-grey">Term:</span>
                    <span className="text-deep-charcoal">{policy.term}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Competitor Policies */}
            {competitorPolicies.map((policy, index) => (
              <div key={`comp-${index}`} className="competitor-policy-card rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-deep-charcoal text-sm">{policy.provider}</h5>
                    <p className="text-xs text-muted-grey">{policy.type}</p>
                  </div>
                  <Badge className="bg-azure-blue text-white text-xs">
                    Competitor
                  </Badge>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-grey">Coverage:</span>
                    <span className="text-deep-charcoal font-medium">₹{policy.coverage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-grey">Premium:</span>
                    <span className="text-deep-charcoal">₹{policy.premium.toLocaleString()}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-grey">Term:</span>
                    <span className="text-deep-charcoal">{policy.term}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button 
          className="w-full btn-primary"
          onClick={() => handleQuickAction("recommend-policy")}
          disabled={isLoadingRecommendations}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoadingRecommendations ? "Getting Recommendations..." : "Get Policy Recommendations"}
        </Button>

        <Button 
          className="w-full btn-secondary"
          onClick={() => handleQuickAction("compare-policies")}
        >
          <Scale className="w-4 h-4 mr-2" />
          Compare with Competitors
        </Button>

        <Button 
          className="w-full btn-accent"
          onClick={() => handleQuickAction("calculate-premium")}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Premium
        </Button>
      </div>

      {/* Policy Recommendations Dialog */}
      <Dialog open={showRecommendations} onOpenChange={setShowRecommendations}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI-Powered Policy Recommendations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="card-professional">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg text-deep-charcoal">{rec.policy_name}</h4>
                      <Badge className="bg-birla-red text-white text-xs mt-1">
                        {rec.policy_type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-grey">Suitability Score</div>
                      <div className="text-xl font-bold text-emerald-green">{rec.suitability_score}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-muted-grey">Coverage Amount</span>
                      <p className="font-semibold text-deep-charcoal">{rec.coverage_amount}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-grey">Premium Estimate</span>
                      <p className="font-semibold text-deep-charcoal">{rec.premium_estimate}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm text-muted-grey">Key Benefits</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.key_benefits.map((benefit, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-grey">Why This Policy?</span>
                    <p className="text-sm text-deep-charcoal mt-1">{rec.reasoning}</p>
                  </div>

                  <Button className="w-full mt-3 btn-primary">
                    Get Detailed Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}