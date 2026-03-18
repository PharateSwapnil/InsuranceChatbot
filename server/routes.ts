import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { nanoid } from "nanoid";

// Simple in-memory session store for development
const sessions = new Map();

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
const isDevelopment = process.env.NODE_ENV === "development";

// Store conversation history per session
const conversationHistory = new Map();

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use((req, res, next) => {
    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId;
    if (sessionId && sessions.has(sessionId)) {
      (req as any).session = sessions.get(sessionId);
    }
    next();
  });

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

      // Create session
      const sessionId = nanoid();
      const sessionData = { user };
      sessions.set(sessionId, sessionData);

      // Set session cookie
      res.cookie('sessionId', sessionId, { 
        httpOnly: true, 
        secure: false, // Set to true in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

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

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = req.body;
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      console.error("Create customer error:", error);
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
        user_id,
        customer_id: customer_id || null,
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

      console.log("Groq API Key available:", !!groqApiKey);
      console.log("Processing message:", message);

      // Get customer context if provided
      let customerContext = "";
      if (customer_id) {
        const customer = await storage.getCustomer(customer_id);
        if (customer) {
          const existingPolicies = JSON.parse(customer.existing_policies);
          const financialGoals = JSON.parse(customer.financial_goals);
          const healthConditions = JSON.parse(customer.health_conditions);

          customerContext = `
CUSTOMER ANALYSIS FOR SALES ADVISOR:
Customer: ${customer.name}
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

SALES GUIDANCE: Analyze this customer profile and provide recommendations for Aditya Birla Insurance products. Help the sales advisor understand customer needs and suggest appropriate talking points.
`;
        }
      }

      // Get user information and exemptions for personalized guidance
      const sessionUser = (req as any).session?.user;
      let currentAdvisor = null;
      let userExemptions: any[] = [];
      let exemptionGuidance = "";
      let advisorContext = "";

      if (sessionUser) {
        try {
          currentAdvisor = await storage.getUserByUsername(sessionUser.username);
          if (currentAdvisor) {
            userExemptions = await storage.getUserExemptions(currentAdvisor.id);

            advisorContext = `\n\nSALES ADVISOR CONTEXT:
Advisor Name: ${currentAdvisor.name}
Role: ${currentAdvisor.role}
Certification Level: ${userExemptions.length > 0 ? userExemptions[0].certification_type : 'Standard'}`;

            if (userExemptions.length > 0) {
              exemptionGuidance = `\n\nUNDERWRITING EXEMPTION LIMITS FOR ${currentAdvisor.name.toUpperCase()}:
${userExemptions.map(ex => `- ${ex.product_type}: Up to ₹${ex.exemption_limit.toLocaleString()} (${ex.certification_type} authority)`).join('\n')}

SALES AUTHORITY VALIDATION:
- For requests WITHIN limits: Instant approval available - emphasize quick processing
- For requests ABOVE limits: Must inform about full underwriting requirement

RESPONSE FORMAT: Always start your response with "Hi ${currentAdvisor.name}," and validate coverage amounts against exemption limits before recommending policies.`;
            }
          }
        } catch (error) {
          console.error("Error fetching user exemptions:", error);
        }
      }

      // Get or create conversation history for this session
      const sessionKey = chat_session_id || `${user_id}_default`;
      if (!conversationHistory.has(sessionKey)) {
        conversationHistory.set(sessionKey, []);
      }
      const history = conversationHistory.get(sessionKey)!;

      // System prompt for AB i Assistant
      const systemPrompt = `You are "AB i Assistant" (Aditya Birla i Assistant) — a professional AI assistant designed to help Aditya Birla Insurance sales advisors.

IMPORTANT RESPONSE FORMAT: Always start your response with "Hi ${currentAdvisor?.name || 'Sales Advisor'}," to personalize the interaction.

Your role is to ASSIST THE SALES ADVISOR by providing:
1. Customer analysis and policy recommendations for their prospects
2. Detailed information about Aditya Birla Insurance products:
   - Health Insurance (Activ Health Enhanced, Activ Care, Activ Fit)
   - Life Insurance 
   - Term Plans (Protect@Ease, Protect@Active, Family Protect Plan)
   - Child Plans (Child Secure Plan)
   - Retirement Plans (Vision Life Pension Plan)
   - Investment-linked Insurance (Vision LifeWealth Plan)

3. Competitive analysis when customers have policies with other providers
4. Sales talking points and objection handling strategies
5. Underwriting guidance and policy limits

IMPORTANT: You are talking TO the sales advisor, NOT to the customer. 
- Address the sales advisor directly by name
- Provide sales guidance and talking points
- Help the advisor understand customer needs and recommend appropriate policies

SPECIAL PROFESSION HANDLING:
When dealing with high-risk professions like FARMING, MINING, AVIATION, or other hazardous occupations:
- 🚨 **FARMING PROFESSION ALERT**: Flag for enhanced underwriting
- Require additional documentation: Income proof, land ownership, crop insurance details
- Agricultural income assessment: Seasonal variations, crop dependency, weather risks
- Recommend higher health coverage due to occupational hazards
- Consider specialized agricultural insurance products
- Manual underwriting required regardless of coverage amount
- Extended waiting periods may apply

Key Aditya Birla advantages to help advisors highlight:
- Highest claim settlement ratio (98.2%)
- Comprehensive coverage with no room rent capping
- Global coverage and wellness rewards
- Quick claim processing (24-48 hours)
- Tax benefits under 80C, 80D, and 10(10D)
- Flexible premium payment options
- Superior customer service

6. Write a short, effective, important Pitching/scripting 3 lines based on customer questions at every response.

Always be empathetic, professional, and focus on customer needs. Use bullet points for clarity and ask clarifying questions when needed.

${customerContext}${exemptionGuidance}`;

      // Call Groq API
      let aiResponse = "";

      if (groqApiKey && groqApiKey.trim() !== "" && groqApiKey !== "your_actual_groq_api_key_here") {
        try {
          // Build conversation messages including history
          const messages = [
            { role: "system", content: systemPrompt + advisorContext + customerContext + exemptionGuidance }
          ];

          // Add conversation history (last 10 messages to avoid token limits)
          const recentHistory = history.slice(-10);
          messages.push(...recentHistory);

          // Add current message
          messages.push({ role: "user", content: message });

          console.log("Calling Groq API with", messages.length, "messages");

          const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${groqApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: messages,
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

            console.log("Groq API response received successfully");

            // Add to conversation history
            history.push({ role: "user", content: message });
            history.push({ role: "assistant", content: aiResponse });

          } else {
            const errorText = await response.text();
            console.error(`Groq API error: ${response.status} - ${errorText}`);
            throw new Error(`Groq API error: ${response.status}`);
          }
        } catch (error) {
          console.error("Groq API error:", error);
          aiResponse = generateFallbackResponse(message, customerContext, currentAdvisor, userExemptions);
        }
      } else {
        console.log("Using fallback response - API key missing or invalid");
        aiResponse = generateFallbackResponse(message, customerContext, currentAdvisor, userExemptions);
      }

      // Log the interaction
      if (chat_session_id && user_id) {
        await storage.createInteractionLog({
          user_id,
          chat_id: chat_session_id,
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

  // Get user profile with exemptions
  app.get("/api/users/:id/profile", async (req, res) => {
    try {
      const { id } = req.params;
      const sessionUser = (req as any).session?.user;

      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Use the session user data directly or fetch from database
      let user = sessionUser;
      if (!user.id || user.id !== id) {
        user = await storage.getUserByUsername(sessionUser.username);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }

      const exemptions = await storage.getUserExemptions(user.id);

      res.json({
        user,
        exemptions
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Fallback response generator when Groq API is not available
function generateFallbackResponse(
  message: string,
  customerContext: string,
  currentAdvisor: any = null,
  userExemptions: any[] = [],
): string {
  const lowerMessage = message.toLowerCase();
  const advisorName = currentAdvisor?.name || "Sales Advisor";

  // Always start with advisor's name
  const greeting = `Hi ${advisorName},`;

  // Check for farming profession in customer context
  const isFarmingCustomer = customerContext.toLowerCase().includes('farming') || 
                           customerContext.toLowerCase().includes('farmer') ||
                           customerContext.toLowerCase().includes('agriculture');

  let farmingAlert = "";
  if (isFarmingCustomer) {
    farmingAlert = `\n\n🚨 **HIGH-RISK PROFESSION ALERT - FARMING DETECTED**

**MANDATORY UNDERWRITING REQUIREMENTS:**
- Enhanced documentation required regardless of coverage amount
- Agricultural income verification (last 3 years)
- Land ownership/lease documents
- Crop insurance details and claims history
- Seasonal income pattern analysis
- Manual underwriting by senior underwriter

**SALES APPROACH FOR FARMING CUSTOMERS:**
✅ Emphasize comprehensive health coverage (higher occupational risks)
✅ Explain additional documentation upfront to set expectations  
✅ Highlight our 98.2% claim settlement ratio for trust building
✅ Recommend flexible premium payment aligned with harvest cycles
✅ Position Aditya Birla's understanding of agricultural sector

**PROCESSING TIME: 15-21 days** (vs standard 7-14 days)`;
  }

  // Extract coverage amounts from message
  const coverageMatch = message.match(/(\d+)\s*(cr|crore|lakh|lakhs)/i);
  let requestedCoverage = 0;
  if (coverageMatch) {
    const amount = parseInt(coverageMatch[1]);
    const unit = coverageMatch[2].toLowerCase();
    requestedCoverage = unit.includes('cr') ? amount * 10000000 : amount * 100000;
  }

  // Check underwriting limits
  let underwritingWarning = "";
  if (requestedCoverage > 0 && userExemptions.length > 0) {
    const relevantExemption = userExemptions.find(ex => 
      lowerMessage.includes(ex.product_type.toLowerCase()) ||
      (lowerMessage.includes('health') && ex.product_type.includes('Health')) ||
      (lowerMessage.includes('term') && ex.product_type.includes('Term')) ||
      (lowerMessage.includes('wealth') && ex.product_type.includes('Investment'))
    );

    if (relevantExemption && requestedCoverage > relevantExemption.exemption_limit) {
      underwritingWarning = `\n\n⚠️ **UNDERWRITING ALERT FOR ${advisorName.toUpperCase()}:**
The requested ₹${(requestedCoverage/10000000).toFixed(1)} Cr coverage exceeds your ${relevantExemption.certification_type} exemption limit of ₹${(relevantExemption.exemption_limit/100000).toFixed(0)} Lakh for ${relevantExemption.product_type}.

**You must inform the customer:**
"For coverage above ₹${(relevantExemption.exemption_limit/100000).toFixed(0)} Lakh, full underwriting is required including medical examination, financial documentation, and underwriter approval. Processing time: 7-14 days vs instant approval for coverage within limits."`;
    }
  }

  if (
    lowerMessage.includes("health insurance") ||
    lowerMessage.includes("medical cover")
  ) {
    return `${greeting}

**🏥 Here's your Health Insurance guidance:**

I recommend presenting these Aditya Birla Health Insurance options to your customer:

**Activ Health Enhanced** - Position as our flagship plan
• Coverage: **₹3L to ₹1Cr** (Family Floater)
• Premium: Starting **₹5,500/year**
• Key selling points: No room rent capping, global coverage, wellness rewards
• Claim Settlement: **98.2%** (Industry leading)

**Activ Care** - Present for comprehensive protection needs
• Coverage: **₹2L to ₹1Cr**
• Premium: Starting **₹3,800/year**  
• Network: **6,500+** cashless hospitals
• Special feature: Maternity coverage from day 1

**🎯 Your key talking points:**
✅ **98.2%** claim settlement ratio (industry best)
✅ No room rent capping or sub-limits
✅ **6,500+** cashless hospitals
✅ Global coverage for emergencies
✅ Wellness rewards program

${customerContext ? "Based on the customer profile, I can help you tailor your presentation." : "Select a customer to get personalized sales recommendations."}

${underwritingWarning}

Would you like me to help you prepare a detailed proposal?`;
  }

  if (
    lowerMessage.includes("term insurance") ||
    lowerMessage.includes("life cover")
  ) {
    return `${greeting}

**🛡️ Term Insurance Solutions**

Our term insurance plans offer maximum life coverage at affordable premiums:

| Plan | Coverage | Key Features | Premium (30yr Male) | Tax Benefits |
|------|----------|--------------|-------------------|--------------|
| **Protect@Ease** | ₹25L to ₹10Cr | Sum assured return, Premium waiver | ₹12,000/year | ₹1.5L (80C) + ₹10L (10D) |
| **Protect@Active** | ₹50L to ₹5Cr | Increasing cover, Critical illness rider | ₹8,500/year | ₹1.5L (80C) + ₹10L (10D) |

**Key Features:**
• **Protect@Ease**: Comprehensive term plan with return of premium option
• **Protect@Active**: Value-focused term plan for young professionals

**💪 Why choose Aditya Birla Term Insurance?**
✅ **10-15%** lower premiums than competitors
✅ **98.2%** claim settlement ratio
✅ Flexible premium payment options
✅ Multiple rider options available
✅ Quick claim processing (**24-48 hours**)

${customerContext ? "I can calculate specific premium recommendations based on the customer profile." : ""}

Would you like me to calculate premium for a specific coverage amount?`;
  }

  if (
    lowerMessage.includes("compare") ||
    lowerMessage.includes("competition")
  ) {
    return `${greeting}

**⚖️ Aditya Birla vs Competitors**

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
    return `${greeting}

**💰 Premium Calculator**

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
  return `${greeting}

I'm AB i Assistant, your AI assistant for Aditya Birla Insurance. I can help you with:

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

${farmingAlert}

How can I help you today? You can ask about specific insurance products, premium calculations, or policy comparisons.`;
}