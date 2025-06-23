import { apiRequest } from "./queryClient";
import type { ChatMessage } from "@shared/schema";

export class ChatService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || "";
    this.baseUrl = "https://api.groq.com/openai/v1/chat/completions";
  }

  async sendMessage(
    message: string,
    customerId?: string,
    chatSessionId?: string,
    userId?: string
  ): Promise<string> {
    try {
      // Use our backend API which handles the Groq integration
      const response = await apiRequest("POST", "/api/chat/message", {
        message,
        customer_id: customerId,
        chat_session_id: chatSessionId,
        user_id: userId
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Chat service error:", error);
      throw new Error("Failed to send message. Please try again.");
    }
  }

  async createChatSession(userId: string, customerId?: string) {
    try {
      const response = await apiRequest("POST", "/api/chat/session", {
        user_id: userId,
        customer_id: customerId
      });

      return response.json();
    } catch (error) {
      console.error("Create chat session error:", error);
      throw new Error("Failed to create chat session.");
    }
  }

  async updateChatSession(sessionId: string, updates: { customer_id?: string; is_active?: boolean }) {
    try {
      const response = await apiRequest("PUT", `/api/chat/session/${sessionId}`, updates);
      return response.json();
    } catch (error) {
      console.error("Update chat session error:", error);
      throw new Error("Failed to update chat session.");
    }
  }

  // Utility method to format messages for display
  formatMessage(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-birla-red font-semibold">$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '<span class="text-muted-grey">•</span> ')
      .replace(/✅ /g, '<span class="text-emerald-green text-lg">✅</span> ')
      .replace(/❌ /g, '<span class="text-birla-red text-lg">❌</span> ')
      .replace(/🎯/g, '<span class="text-birla-red text-lg">🎯</span>')
      .replace(/📊/g, '<span class="text-azure-blue text-lg">📊</span>')
      .replace(/💼/g, '<span class="text-gold-accent text-lg">💼</span>')
      .replace(/🏥/g, '<span class="text-emerald-green text-lg">🏥</span>')
      .replace(/🛡️/g, '<span class="text-trust-navy text-lg">🛡️</span>')
      .replace(/💰/g, '<span class="text-gold-accent text-lg">💰</span>')
      .replace(/⚖️/g, '<span class="text-azure-blue text-lg">⚖️</span>');
  }

  // Method to generate quick action prompts
  getQuickActionPrompt(action: string, customerName?: string): string {
    const prompts: Record<string, string> = {
      "health-insurance": "Tell me about Aditya Birla's health insurance plans, including Activ Health Enhanced and Activ Care. Include coverage options, premiums, and key benefits.",
      
      "life-insurance": "Tell me about Aditya Birla's life insurance plans, including Protect@Ease and Protect@Active. Include coverage options, premiums, and key benefits.",
      
      "term-plans": "Show me Aditya Birla's term insurance options like Protect@Ease and Protect@Active. Include coverage amounts, premium ranges, and unique features.",
      
      "compare-policies": "Compare Aditya Birla insurance policies with competitors like LIC, ICICI Prudential, and HDFC Life. Highlight our advantages in claim settlement ratio, premiums, and features.",
      
      "recommend-policy": customerName 
        ? `Based on ${customerName}'s profile, demographics, existing policies, and financial goals, recommend the most suitable Aditya Birla insurance policies. Include specific reasons for each recommendation.`
        : "What factors should I consider when recommending insurance policies to customers? Provide guidance on needs analysis and policy selection.",
      
      "calculate-premium": customerName
        ? `Calculate insurance premiums for ${customerName} based on their age, coverage requirements, and risk profile. Show calculations for health, term, and ULIP plans.`
        : "Explain how insurance premiums are calculated. Include factors that affect pricing and provide sample calculations for different age groups.",
      
      "ulip-plans": "Explain Aditya Birla's ULIP products like Vision LifeIncome Plan and Vision LifeWealth Plan. Include investment options, fund performance, and tax benefits.",
      
      "child-plans": "Tell me about Aditya Birla's child insurance plans. Explain how they help with education funding and child's financial security.",
      
      "retirement-planning": "Describe Aditya Birla's retirement and pension plans. Include annuity options, corpus building strategies, and tax benefits.",
      
      "claim-process": "Explain Aditya Birla's claim settlement process, required documents, and our industry-leading settlement ratio of 98.2%."
    };

    return prompts[action] || action;
  }

  // Method to parse and structure AI responses
  parseAIResponse(response: string): {
    summary: string;
    sections: Array<{ title: string; content: string }>;
    recommendations?: string[];
    nextSteps?: string[];
  } {
    const lines = response.split('\n');
    const sections: Array<{ title: string; content: string }> = [];
    let currentSection: { title: string; content: string } | null = null;
    let summary = '';
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for section headers (lines starting with **)
      if (trimmedLine.match(/^\*\*(.*?)\*\*$/)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.replace(/\*\*/g, ''),
          content: ''
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      } else if (!summary && trimmedLine) {
        summary = trimmedLine;
      }

      // Extract recommendations and next steps
      if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
        const item = trimmedLine.substring(2);
        if (currentSection?.title.toLowerCase().includes('recommend')) {
          recommendations.push(item);
        } else if (currentSection?.title.toLowerCase().includes('next') || 
                   currentSection?.title.toLowerCase().includes('step')) {
          nextSteps.push(item);
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      summary: summary || response.substring(0, 200) + '...',
      sections,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      nextSteps: nextSteps.length > 0 ? nextSteps : undefined
    };
  }

  // Method to validate customer context
  validateCustomerContext(customer: any): boolean {
    return !!(
      customer &&
      customer.id &&
      customer.name &&
      customer.age &&
      customer.existing_policies
    );
  }

  // Method to build customer context string for AI
  buildCustomerContext(customer: any): string {
    if (!this.validateCustomerContext(customer)) {
      return "";
    }

    try {
      const existingPolicies = JSON.parse(customer.existing_policies || "[]");
      const financialGoals = JSON.parse(customer.financial_goals || "[]");
      const healthConditions = JSON.parse(customer.health_conditions || "{}");
      
      const activeHealthConditions = Object.entries(healthConditions)
        .filter(([_, value]) => value)
        .map(([key]) => key.replace('_', ' '));

      return `
Customer: ${customer.name}
Age: ${customer.age} | Gender: ${customer.gender} | City: ${customer.city}
Marital Status: ${customer.marital_status} | Dependents: ${customer.dependents_count}
Profession: ${customer.profession} | Income: ${customer.income_bracket}
Risk Appetite: ${customer.risk_appetite}
Financial Goals: ${financialGoals.join(', ')}
Health Conditions: ${activeHealthConditions.length > 0 ? activeHealthConditions.join(', ') : 'None reported'}
Current Policies: ${existingPolicies.map((p: any) => `${p.provider} ${p.type} (₹${p.coverage}, ₹${p.premium}/yr)`).join('; ')}`;
    } catch (error) {
      console.error("Error building customer context:", error);
      return `Customer: ${customer.name} (Age: ${customer.age})`;
    }
  }
}

export const chatService = new ChatService();
