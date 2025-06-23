import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Bot, 
  User as UserIcon, 
  Settings, 
  History,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Menu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { chatService } from "@/lib/chat-service";
import type { User } from "@/App";
import type { Customer, ChatMessage } from "@shared/schema";
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  user: User;
  selectedCustomer: Customer | null;
  chatSessionId: string;
  setChatSessionId: (id: string) => void;
  onShowProfile?: () => void;
  isMobile?: boolean;
}

export default function ChatInterface({ 
  user, 
  selectedCustomer, 
  chatSessionId, 
  setChatSessionId,
  onShowProfile,
  isMobile = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize chat session
  const { mutate: createChatSession } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/session", {
        user_id: user.id,
        customer_id: selectedCustomer?.id || null
      });
      return response.json();
    },
    onSuccess: (data) => {
      setChatSessionId(data.id);
    }
  });

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat/message", {
        message,
        customer_id: selectedCustomer?.id || null,
        chat_session_id: chatSessionId,
        user_id: user.id
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error: any) => {
      setIsTyping(false);
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  // Initialize chat session on mount
  useEffect(() => {
    if (!chatSessionId) {
      createChatSession();
    }
  }, []);

  // Add welcome message when customer is selected
  useEffect(() => {
    if (selectedCustomer && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: "system",
        content: `Customer ${selectedCustomer.name} selected. I now have access to their profile and can provide personalized insurance recommendations based on their demographics, existing policies, and financial goals.`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedCustomer]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message if no customer selected
  useEffect(() => {
    if (!selectedCustomer && messages.length === 0) {
      const initialMessage: ChatMessage = {
        role: "assistant",
        content: `Hi! I'm ABHi, your AI assistant for Aditya Birla Insurance. I can help you with:

**🎯 Policy Recommendations**
• Analyze customer profiles for best-fit policies
• Compare our products with competitors
• Calculate premiums and coverage requirements

**📊 Customer Management**
• Access customer information and policy history
• Track interaction logs and preferences
• Generate personalized proposals

**💼 Sales Support**
• Product knowledge and feature comparisons
• Objection handling and competitive analysis
• Quote generation and policy illustrations

Please select a customer using the search bar to get personalized recommendations, or ask me about our insurance products!`,
        timestamp: new Date().toISOString()
      };
      setMessages([initialMessage]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    let messageContent = inputMessage.trim();

    // Handle file uploads
    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map(file => file.name).join(", ");
      messageContent = messageContent 
        ? `${messageContent}\n\n📎 Attached files: ${fileNames}`
        : `📎 Uploaded files: ${fileNames}`;
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Clear input and files
    setInputMessage("");
    setUploadedFiles([]);
    setShowFileUpload(false);
    setIsTyping(true);

    // Send to AI
    sendMessage(messageContent);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      "health-insurance": "Tell me about Aditya Birla health insurance plans",
      "term-plans": "Show me term insurance options available",
      "compare-policies": "Compare our policies with competitors",
      "recommend-policy": selectedCustomer 
        ? `Recommend the best insurance policies for ${selectedCustomer.name}` 
        : "What insurance policies do you recommend?",
      "calculate-premium": selectedCustomer
        ? `Calculate insurance premiums for ${selectedCustomer.name}`
        : "How do I calculate insurance premiums?",
    };

    const message = actionMessages[action] || action;
    setInputMessage(message);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    setShowFileUpload(true);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length === 1) {
      setShowFileUpload(false);
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '• ')
      .replace(/✅ /g, '<span class="text-emerald-green">✅ </span>')
      .replace(/🎯/g, '<span class="text-birla-red">🎯</span>')
      .replace(/📊/g, '<span class="text-azure-blue">📊</span>')
      .replace(/💼/g, '<span class="text-gold-accent">💼</span>');
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  return (
    <div className="flex flex-col h-full bg-light-grey">
      {/* Chat Header */}
      <div className="p-4 border-b border-soft-grey bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowProfile}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="w-10 h-10 bg-emerald-green rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-deep-charcoal">ABHi Assistant</h3>
              <div className="flex items-center space-x-1">
                <div className="status-dot"></div>
                <p className="text-xs status-online">Online - Ready to help</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-muted-grey hover:text-deep-charcoal">
              <History className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-grey hover:text-deep-charcoal">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {selectedCustomer && (
          <div className="mt-2 p-2 bg-light-grey rounded-lg">
            <p className="text-xs text-muted-grey">Active Customer:</p>
            <p className="text-sm font-medium text-deep-charcoal">{selectedCustomer.name}</p>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start space-x-3 ${
            message.role === 'user' ? 'justify-end' : ''
          } animate-slide-up`}>
            {message.role !== 'user' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant' ? 'bg-emerald-green' : 'bg-azure-blue'
              }`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`rounded-lg p-4 max-w-[85%] shadow-sm ${
              message.role === 'user' 
                ? 'message-user' 
                : message.role === 'assistant'
                ? 'message-assistant'
                : 'message-system'
            }`}>
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none text-deep-charcoal">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-bold text-trust-navy mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold text-trust-navy mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-medium text-trust-navy mb-1">{children}</h3>,
                      strong: ({ children }) => {
                        const content = String(children);
                        // All highlighted text should be bold black
                        return <strong className="font-bold text-black">{children}</strong>;
                      },
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                      li: ({ children }) => {
                        const content = String(children);
                        let className = "text-sm";
                        // Highlight benefit points
                        if (content.includes('✅') || content.includes('benefit') || content.includes('advantage')) {
                          className += " text-emerald-green";
                        }
                        // Highlight coverage amounts
                        if (content.includes('₹') || content.includes('coverage')) {
                          className += " font-medium";
                        }
                        return <li className={className}>{children}</li>;
                      },
                      p: ({ children }) => {
                        const content = String(children);
                        let className = "mb-2 text-sm leading-relaxed";
                        // Highlight greeting lines
                        if (content.includes('Hi ') && content.includes(',')) {
                          className += " text-trust-navy font-medium text-base";
                        }
                        return <p className={className}>{children}</p>;
                      },
                      // Custom component for highlighting special text patterns
                      text: ({ children }) => {
                        const content = String(children);
                        // Highlight currency amounts
                        if (content.match(/₹[\d,]+/)) {
                          return <span className="font-semibold text-emerald-green bg-emerald-green/10 px-1 rounded">{children}</span>;
                        }
                        // Highlight percentages
                        if (content.match(/\d+\.?\d*%/)) {
                          return <span className="font-semibold text-azure-blue bg-azure-blue/10 px-1 rounded">{children}</span>;
                        }
                        return <span>{children}</span>;
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm leading-relaxed">
                  {message.content}
                </div>
              )}
              <p className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue/75' : 'text-muted-grey'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-trust-navy rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3 animate-fade-in">
            <div className="w-8 h-8 bg-emerald-green rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-lg p-4 border border-soft-grey">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-grey rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-muted-grey rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-muted-grey rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Buttons (shown when no messages or after assistant message) */}
        {(messages.length === 0 || (messages.length > 0 && messages[messages.length - 1].role === 'assistant')) && !isTyping && (
          <div className="flex flex-wrap gap-2 justify-center py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("health-insurance")}
              className="btn-primary text-xs"
            >
              Health Insurance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("term-plans")}
              className="btn-secondary text-xs"
            >
              Term Plans
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("compare-policies")}
              className="btn-accent text-xs"
            >
              Compare Policies
            </Button>
            {selectedCustomer && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("recommend-policy")}
                  className="border-emerald-green text-emerald-green hover:bg-emerald-green hover:text-white text-xs"
                >
                  Get Recommendations
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("calculate-premium")}
                  className="border-azure-blue text-azure-blue hover:bg-azure-blue hover:text-white text-xs"
                >
                  Calculate Premium
                </Button>
              </>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Area */}
      {showFileUpload && (
        <div className="px-4 py-2 border-t border-soft-grey bg-white">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-light-grey rounded-lg p-2">
                <div className="w-6 h-6 bg-azure-blue rounded flex items-center justify-center">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-3 h-3 text-white" />
                  ) : (
                    <FileText className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-xs text-deep-charcoal truncate max-w-24">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-4 w-4 p-0 text-muted-grey hover:text-birla-red"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-soft-grey">
        <div className="flex items-end space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-grey hover:text-deep-charcoal"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or ask about insurance policies..."
              className="chat-textarea min-h-[2.5rem] max-h-32 resize-none focus-ring pr-12"
              disabled={isSending}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-grey hover:text-birla-red"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isSending}
            className="btn-primary"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}