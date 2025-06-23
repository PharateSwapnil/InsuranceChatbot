
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Homepage() {
  const departmentCards = [
    {
      icon: '🏥',
      title: 'Health Insurance',
      description: 'Comprehensive medical coverage with cashless facilities.',
      onClick: () => {
        // Navigate to the insurance login/dashboard
        window.location.href = '/login';
      }
    },
    {
      icon: '🛡️',
      title: 'Life Insurance',
      description: 'Secure your future with customizable life cover plans.',
      onClick: () => {
        // Navigate to the insurance login/dashboard
        window.location.href = '/login';
      }
    },
    {
      icon: '📈',
      title: 'Mutual Funds',
      description: 'Invest smartly with Aditya Birla Sun Life Mutual Fund schemes.',
      onClick: () => {
        window.open('https://www.adityabirlasunlifemf.com', '_blank');
      }
    },
    {
      icon: '💰',
      title: 'Business & Personal Loans',
      description: 'Get quick access to personal, business, and SME loans.',
      onClick: () => {
        window.open('https://www.adityabirlacapital.com', '_blank');
      }
    },
    {
      icon: '🏠',
      title: 'Housing Finance',
      description: 'Affordable home and property loans with flexible terms.',
      onClick: () => {
        window.open('https://www.adityabirlahousing.com', '_blank');
      }
    },
    {
      icon: '💼',
      title: 'Wealth Management',
      description: 'Grow your portfolio with expert advisory and trading tools.',
      onClick: () => {
        window.open('https://www.adityabirlacapital.com/wealth-management', '_blank');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#C8102E] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-[#1A1A1A]">Aditya Birla Assistant</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-[#1A1A1A] hover:text-[#C8102E] font-medium transition-colors">
                About Us
              </a>
              <a href="#contact" className="text-[#1A1A1A] hover:text-[#C8102E] font-medium transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#C8102E] to-[#B50E26] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Smart Gateway to Aditya Birla Financial Services
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Powered by AI for Your Financial Journey
          </p>
        </div>
      </section>

      {/* Department Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              Explore Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover comprehensive financial solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentCards.map((card, index) => (
              <Card 
                key={index}
                className="group cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border-2 hover:border-[#FFD700] rounded-2xl overflow-hidden bg-white"
                onClick={card.onClick}
              >
                <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3 group-hover:text-[#C8102E] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button 
                      className="w-full bg-[#C8102E] hover:bg-[#B50E26] text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 group-hover:bg-[#FFD700] group-hover:text-[#1A1A1A]"
                    >
                      Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Chat Assistant Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="w-14 h-14 rounded-full bg-[#C8102E] hover:bg-[#B50E26] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          onClick={() => window.location.href = '/login'}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04.97 4.43L1 23l6.57-1.97C9.96 21.64 11.46 22 13 22h7c1.1 0 2-.9 2-2V12c0-5.52-4.48-10-10-10zm0 15c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-3h-2V8h2v6z"/>
          </svg>
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#C8102E] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold">Aditya Birla Group</span>
              </div>
              <p className="text-[#F5F5F5] leading-relaxed max-w-md">
                A leading Indian multinational conglomerate, headquartered in Mumbai. 
                We are committed to delivering sustainable value to all stakeholders.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#FFD700]">Quick Links</h4>
              <ul className="space-y-2 text-[#F5F5F5]">
                <li><a href="#" className="hover:text-[#FFD700] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#FFD700] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#FFD700] transition-colors">Investor Relations</a></li>
                <li><a href="#" className="hover:text-[#FFD700] transition-colors">Sustainability</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#FFD700]">Contact Info</h4>
              <ul className="space-y-2 text-[#F5F5F5]">
                <li>📞 1800-270-7000</li>
                <li>✉️ info@adityabirla.com</li>
                <li>📍 Mumbai, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-[#F5F5F5]">
            <p>&copy; 2025 Aditya Birla Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
