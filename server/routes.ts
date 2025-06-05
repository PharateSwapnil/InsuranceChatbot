import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { nanoid } from "nanoid";

// Load environment variables
const groqApiKey =
  process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
const isDevelopment = process.env.NODE_ENV === "development";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use proper session management
      res.json({
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/customers/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const customers = await storage.searchCustomers(query);
      res.json(customers);
    } catch (error) {
      console.error("Search customers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Get customer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Policy routes
  app.get("/api/policies", async (req, res) => {
    try {
      const policies = await storage.getPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Get policies error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/policies/type/:type", async (req, res) => {
    try {
      const policies = await storage.getPoliciesByType(req.params.type);
      res.json(policies);
    } catch (error) {
      console.error("Get policies by type error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Competitor policy routes
  app.get("/api/competitor-policies", async (req, res) => {
    try {
      const policies = await storage.getCompetitorPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Get competitor policies error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chat routes
  app.post("/api/chat/session", async (req, res) => {
    try {
      const { user_id, customer_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const session = await storage.createChatSession({
        id: nanoid(),
        user_id,
        customer_id: customer_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: 1,
      });

      res.json(session);
    } catch (error) {
      console.error("Create chat session error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/chat/session/:id", async (req, res) => {
    try {
      const { customer_id, is_active } = req.body;

      const session = await storage.updateChatSession(req.params.id, {
        customer_id,
        is_active,
      });

      res.json(session);
    } catch (error) {
      console.error("Update chat session error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Chat route
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { message, customer_id, chat_session_id, user_id } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get customer context if provided
      let customerContext = "";
      if (customer_id) {
        const customer = await storage.getCustomer(customer_id);
        if (customer) {
          const existingPolicies = JSON.parse(customer.existing_policies);
          const financialGoals = JSON.parse(customer.financial_goals);
          const healthConditions = JSON.parse(customer.health_conditions);

          customerContext = `
Customer Profile:
- Age: ${customer.age}
- Gender: ${customer.gender}
- Marital Status: ${customer.marital_status}
- Profession: ${customer.profession}
- Income Bracket: ${customer.income_bracket}
- City: ${customer.city}
- Dependents: ${customer.dependents_count}
- Risk Appetite: ${customer.risk_appetite}
- Financial Goals: ${financialGoals.join(", ")}
- Health Conditions: ${
            Object.entries(healthConditions)
              .filter(([_, value]) => value)
              .map(([key]) => key)
              .join(", ") || "None reported"
          }
- Existing Policies: ${existingPolicies.map((p: any) => `${p.provider} ${p.type} (₹${p.coverage} coverage, ₹${p.premium}/year)`).join(", ")}
`;
        }
      }

      // System prompt for ABHi
      const systemPrompt = `You are "ABHi" (Aditya Birla Hybrid Insurance) Assistant — a professional AI insurance policy sales Advisor for Aditya Birla Insurance.

Your job is to:
1. Understand customer needs and demographics
2. Recommend the most suitable insurance policy offered by Aditya Birla Insurance across:
   - Health Insurance (Activ Health Enhanced, Activ Care, Activ Fit)
   - Life Insurance 
   - Term Plans (Protect@Ease, Protect@Active, Family Protect Plan)
   - Child Plans (Child Secure Plan)
   - Retirement Plans (Vision Life Pension Plan)
   - Investment-linked Insurance (Vision LifeWealth Plan)

3. If the customer holds policies with other providers, compare them with Aditya Birla policies and explain our superior benefits:
   - Our claim settlement ratio: 98.2% (industry leading)
   - 6,500+ cashless network hospitals
   - Lower premiums (10-20% savings)
   - Better features and riders
   - 24-48 hour claim processing

4. Clearly answer insurance-related questions in simple terms
5. Build trust and long-term relationships

Key Aditya Birla advantages to highlight:
- Highest claim settlement ratio (98.2%)
- Comprehensive coverage with no room rent capping
- Global coverage and wellness rewards
- Quick claim processing (24-48 hours)
- Tax benefits under 80C, 80D, and 10(10D)
- Flexible premium payment options
- Superior customer service

6. Write a short, effective, important Pitching/scripting 3 lines based on customer questions at every response.

Always be empathetic, professional, and focus on customer needs. Use bullet points for clarity and ask clarifying questions when needed.

${customerContext}`;

      // Call Groq API
      let aiResponse = "";

      if (groqApiKey) {
        try {
          const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${groqApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: message },
                ],
                temperature: 0.7,
                max_tokens: 1000,
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            aiResponse =
              data.choices[0]?.message?.content ||
              "I apologize, but I'm having trouble generating a response right now. Please try again.";
          } else {
            throw new Error(`Groq API error: ${response.status}`);
          }
        } catch (error) {
          console.error("Groq API error:", error);
          aiResponse = generateFallbackResponse(message, customerContext);
        }
      } else {
        aiResponse = generateFallbackResponse(message, customerContext);
      }

      // Log the interaction
      if (chat_session_id && user_id) {
        await storage.createInteractionLog({
          id: nanoid(),
          chat_id: chat_session_id,
          user_id,
          customer_id: customer_id || null,
          messages: JSON.stringify([
            {
              role: "user",
              content: message,
              timestamp: new Date().toISOString(),
            },
            {
              role: "assistant",
              content: aiResponse,
              timestamp: new Date().toISOString(),
            },
          ]),
          created_at: new Date().toISOString(),
          recommended_policy: null,
          conversion_status: null,
          feedback_rating: null,
        });
      }

      res.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/chat/recommend-policy", async (req, res) => {
    try {
      const { customer, context, hideCustomerName = true } = req.body;

      if (!customer) {
        return res.status(400).json({ error: "Customer data is required" });
      }

      // Generate structured policy recommendations based on customer profile
      const recommendations = [
        {
          policy_name: "Activ Health Enhanced",
          policy_type: "Health Insurance",
          coverage_amount: "₹10,00,000",
          premium_estimate: "₹15,000/year",
          key_benefits: [
            "No room rent capping",
            "Global coverage",
            "Wellness rewards",
            "6,500+ cashless hospitals",
          ],
          suitability_score: 95,
          reasoning: `Ideal for ${customer.age}-year-old professionals with ${customer.risk_appetite} risk appetite. Comprehensive coverage aligns with financial goals.`,
        },
        {
          policy_name: "Protect@Ease Term Plan",
          policy_type: "Term Life Insurance",
          coverage_amount: "₹1,00,00,000",
          premium_estimate: "₹25,000/year",
          key_benefits: [
            "High coverage",
            "Tax benefits",
            "Flexible terms",
            "Critical illness rider",
          ],
          suitability_score: 90,
          reasoning: `Perfect life coverage for someone in ${customer.income_bracket} income bracket with ${customer.dependents_count} dependents.`,
        },
        {
          policy_name: "Vision LifeWealth Plan",
          policy_type: "ULIP",
          coverage_amount: "₹50,00,000",
          premium_estimate: "₹50,000/year",
          key_benefits: [
            "Investment + Insurance",
            "Tax benefits",
            "Flexible premiums",
            "Wealth creation",
          ],
          suitability_score: 85,
          reasoning: `Combines investment and insurance, suitable for long-term wealth creation goals matching the customer's financial objectives.`,
        },
      ];

      res.json({
        success: true,
        recommendations,
      });
    } catch (error) {
      console.error("Error generating policy recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Fallback response generator when Groq API is not available
function generateFallbackResponse(
  message: string,
  customerContext: string,
): string {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("health insurance") ||
    lowerMessage.includes("medical cover")
  ) {
    return `**🏥 Health Insurance Recommendations**

Based on our analysis, here are our top Aditya Birla Health Insurance plans:

**Activ Health Enhanced** - Our flagship plan
• Coverage: ₹3L to ₹1Cr (Family Floater)
• Premium: Starting ₹5,500/year
• Key Benefits: No room rent capping, global coverage, wellness rewards
• Claim Settlement: 98.2% (Industry leading)

**Activ Care** - Comprehensive protection
• Coverage: ₹2L to ₹1Cr
• Premium: Starting ₹3,800/year  
• Network: 6,500+ cashless hospitals
• Special: Maternity coverage from day 1

**Why choose Aditya Birla Health Insurance?**
✅ 98.2% claim settlement ratio (industry best)
✅ No room rent capping or sub-limits
✅ 6,500+ cashless hospitals
✅ Global coverage for emergencies
✅ Wellness rewards program

${customerContext ? "I can provide personalized recommendations based on the selected customer profile." : "Would you like me to create a personalized recommendation for a specific customer?"}

Shall I generate a detailed quote?`;
  }

  if (
    lowerMessage.includes("term insurance") ||
    lowerMessage.includes("life cover")
  ) {
    return `**🛡️ Term Insurance Solutions**

Our term insurance plans offer maximum life coverage at affordable premiums:

**Protect@Ease** - Premium term plan
• Coverage: ₹25L to ₹10Cr
• Features: Return of premium option, waiver of premium rider
• Claim Settlement: 98.2% success rate
• Tax Benefits: Up to ₹1.5L under 80C + ₹10L under 10(10D)

**Protect@Active** - Value-focused term plan
• Coverage: ₹50L to ₹5Cr  
• Features: Increasing cover option, critical illness rider
• Ideal for: Young professionals and families

**Why choose Aditya Birla Term Insurance?**
✅ 10-15% lower premiums than competitors
✅ 98.2% claim settlement ratio
✅ Flexible premium payment options
✅ Multiple rider options available
✅ Quick claim processing (24-48 hours)

${customerContext ? "I can calculate specific premium recommendations based on the customer profile." : ""}

Would you like me to calculate premium for a specific coverage amount?`;
  }

  if (
    lowerMessage.includes("compare") ||
    lowerMessage.includes("competition")
  ) {
    return `**⚖️ Aditya Birla vs Competitors**

Here's how we outperform major competitors:

**Claim Settlement Ratio:**
• Aditya Birla: 98.2%
• Industry Average: 85-95%
• LIC: 98.5%
• ICICI Prudential: 97.8%
• HDFC Life: 98.0%

**Premium Competitiveness:**
• 10-20% lower than ICICI, HDFC
• Better features at same price points
• No hidden charges or sub-limits

**Unique Advantages:**
✅ Fastest claim processing (24-48 hours)
✅ 6,500+ cashless hospitals (highest network)
✅ Global coverage for health plans
✅ Wellness rewards program
✅ No room rent capping
✅ Digital-first experience

**Customer Service:**
• 24/7 support
• Dedicated relationship managers
• Mobile app with full functionality
• Paperless policy issuance

Would you like a detailed comparison for a specific policy type?`;
  }

  if (
    lowerMessage.includes("premium") ||
    lowerMessage.includes("calculate") ||
    lowerMessage.includes("quote")
  ) {
    return `**💰 Premium Calculator**

I can help calculate premiums for our various insurance products:

**Sample Premium Calculations:**

**Health Insurance (Family of 4):**
• ₹5L coverage: ₹8,500/year
• ₹10L coverage: ₹12,000/year
• ₹25L coverage: ₹18,000/year

**Term Insurance (Male, 30 years, Non-smoker):**
• ₹50L coverage: ₹6,500/year
• ₹1Cr coverage: ₹10,500/year
• ₹2Cr coverage: ₹18,000/year

**ULIP (Investment + Insurance):**
• ₹50,000 annual investment: ₹5L life cover
• ₹1L annual investment: ₹10L life cover
• Expected returns: 10-12% CAGR

**Factors affecting premium:**
• Age and gender
• Health conditions
• Coverage amount
• Policy term
• Add-on riders

${customerContext ? "I can provide exact premium calculations based on the customer details." : "Please provide customer details for accurate premium calculation."}

Would you like a detailed quotation?`;
  }

  // Default response
  return `Hello! I'm ABHi, your AI assistant for Aditya Birla Insurance. I can help you with:

**🎯 Our Insurance Products:**
• **Health Insurance** - Activ Health Enhanced, Activ Care
• **Term Insurance** - Protect@Ease, Protect@Active  
• **ULIPs** - Vision LifeIncome Plan
• **Child Plans** - Child Secure Plan
• **Retirement Plans** - Vision Life Pension Plan

**🏆 Why Aditya Birla Insurance?**
✅ 98.2% claim settlement ratio (industry leading)
✅ 6,500+ cashless hospitals
✅ 24-48 hour claim processing
✅ Lower premiums, better benefits
✅ Global coverage and wellness rewards

**💼 How I can assist:**
• Policy recommendations based on customer needs
• Premium calculations and quotes
• Competitive analysis and comparisons
• Claims assistance and guidance

${customerContext ? "I have access to the customer profile and can provide personalized recommendations." : "Please select a customer to get targeted assistance."}

How can I help you today? You can ask about specific insurance products, premium calculations, or policy comparisons.`;
}
