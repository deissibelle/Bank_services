import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../utils/mockData';
import { Message } from '../types';
import Card from '../components/ui/Card';
import ChatInterface from '../components/support/ChatInterface';

const Support: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userMessages = await mockApi.getMessages(user.id);
        setMessages(userMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [user]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
    setIsSending(true);
    try {
      const newMessage = await mockApi.sendMessage({
        userId: user.id,
        content,
        isUser: true
      });
      
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate a response after a delay
      setTimeout(async () => {
        const responseMessage = await mockApi.sendMessage({
          userId: user.id,
          supportId: '4',
          content: 'Thank you for your message. A support representative will assist you shortly.',
          isUser: false
        });
        
        setMessages(prev => [...prev, responseMessage]);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Customer Support
        </h1>
        <p className="text-gray-600 mt-1">
          We're here to help with any questions or concerns
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat with Support</h2>
            <div className="h-[500px]">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isSending}
              />
            </div>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Options</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Phone Support</h3>
                  <p className="text-gray-600 text-sm">24/7 Customer Service</p>
                  <p className="text-blue-600 font-medium mt-1">+1 (800) 555-1234</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email Support</h3>
                  <p className="text-gray-600 text-sm">Response within 24 hours</p>
                  <p className="text-blue-600 font-medium mt-1">support@securebank.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Live Chat</h3>
                  <p className="text-gray-600 text-sm">Available 8am - 8pm EST</p>
                  <button className="text-blue-600 font-medium mt-1 hover:text-blue-800">
                    Start Chat Session
                  </button>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Help Topics</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <FileText size={18} className="text-gray-400 mr-2" />
                <span>Account Access Issues</span>
              </button>
              <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <FileText size={18} className="text-gray-400 mr-2" />
                <span>Reporting Fraud</span>
              </button>
              <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <FileText size={18} className="text-gray-400 mr-2" />
                <span>Transaction Disputes</span>
              </button>
              <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <FileText size={18} className="text-gray-400 mr-2" />
                <span>Loan Application Help</span>
              </button>
              <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <FileText size={18} className="text-gray-400 mr-2" />
                <span>Mobile Banking Assistance</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;