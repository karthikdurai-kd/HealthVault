import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, AlertTriangle, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  isNonHealthWarning?: boolean;
}

// Markdown parser function
function parseMarkdown(markdown: string): React.ReactNode {
  // Process Bold
  let content = markdown.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
  
  // Process Italic
  content = content.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  // Process Lists with proper spacing
  content = content.replace(/- (.*?)(?=\n|$)/g, '<li class="ml-5">$1</li>');
  content = content.replace(/<li class="ml-5">(.*?)(?=\n<li|$)/g, '<ul class="list-disc space-y-2 my-3"><li class="ml-5">$1</li></ul>');
  
  // Process Headers with proper spacing
  content = content.replace(/#{3} (.*?)(?=\n|$)/g, '<h3 class="text-md font-semibold my-3">$1</h3>');
  content = content.replace(/#{2} (.*?)(?=\n|$)/g, '<h2 class="text-lg font-semibold my-3">$1</h2>');
  content = content.replace(/# (.*?)(?=\n|$)/g, '<h1 class="text-xl font-bold my-4">$1</h1>');
  
  // Process paragraphs for better spacing
  content = content.replace(/\n\n/g, '</p><p class="my-3">');
  
  // Process line breaks
  content = content.replace(/\n/g, '<br />');
  
  // Wrap in paragraph if not starting with a tag
  if (!content.startsWith('<')) {
    content = `<p class="my-2">${content}</p>`;
  }
  
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
}

// Chat health topic validation checker
function isHealthRelated(message: string) {
  const input = message.toLowerCase().trim();
  
  // If the message is too short, let it pass (likely follow-up questions)
  if (input.length < 5) return true;
  
  // Comprehensive health categories and their related terms
  const healthTerminology = {
    // General health terms
    general: ['health', 'medical', 'wellness', 'healthy', 'doctor', 'hospital', 'clinic', 'nurse', 
              'patient', 'checkup', 'exam', 'test', 'screening', 'diagnosis', 'prognosis'],
    
    // Body systems & anatomy
    bodyParts: ['heart', 'lung', 'brain', 'liver', 'kidney', 'blood', 'muscle', 'bone', 'joint', 
                'skin', 'throat', 'stomach', 'intestine', 'colon', 'artery', 'vein', 'nerve',
                'tissue', 'organ', 'immune', 'thyroid', 'pancreas', 'hormone'],
    
    // Conditions & symptoms
    conditions: ['pain', 'ache', 'fever', 'cough', 'cold', 'flu', 'virus', 'infection', 
                 'disease', 'disorder', 'syndrome', 'condition', 'symptom', 'chronic', 'acute',
                 'inflammation', 'swelling', 'rash', 'allergy', 'fatigue', 'tired', 'exhaustion'],
    
    // Measurements & metrics
    metrics: ['level', 'range', 'count', 'rate', 'pressure', 'normal', 'abnormal', 'high', 
              'low', 'elevated', 'measurement', 'reading', 'result', 'test', 'monitor', 'track'],
    
    // Specific health metrics
    specificMetrics: ['blood pressure', 'heart rate', 'pulse', 'temperature', 'bmi', 'weight',
                      'cholesterol', 'glucose', 'sugar', 'a1c', 'hemoglobin', 'vitamin',
                      'mineral', 'electrolyte', 'sodium', 'potassium', 'calcium'],
    
    // Diet & nutrition
    nutrition: ['diet', 'nutrition', 'food', 'eat', 'meal', 'nutrient', 'vitamin', 'mineral',
                'protein', 'carb', 'fat', 'calorie', 'supplement', 'fiber', 'antioxidant'],
    
    // Fitness & exercise
    fitness: ['exercise', 'workout', 'fitness', 'activity', 'strength', 'cardio', 'endurance',
              'stretch', 'flexibility', 'training', 'active', 'sedentary', 'movement'],
    
    // Mental health
    mentalHealth: ['stress', 'anxiety', 'depression', 'mental health', 'psychological', 'therapy',
                  'counseling', 'emotion', 'mood', 'sleep', 'insomnia', 'rest', 'fatigue'],
    
    // Medications & treatments
    medications: ['medicine', 'medication', 'drug', 'pill', 'capsule', 'tablet', 'prescription',
                 'dose', 'treatment', 'therapy', 'procedure', 'surgery', 'operation', 'cure',
                 'remedy', 'regimen', 'protocol'],
    
    // Medical specialties
    specialties: ['cardiology', 'neurology', 'oncology', 'pediatrics', 'geriatrics', 'gastroenterology',
                 'dermatology', 'orthopedics', 'gynecology', 'urology', 'psychiatry', 'endocrinology'],
    
    // Diseases & specific conditions
    diseases: ['diabetes', 'cancer', 'hypertension', 'arthritis', 'asthma', 'alzheimer', 'parkinsons',
              'hiv', 'aids', 'stroke', 'heart attack', 'heart disease', 'copd', 'obesity', 'osteoporosis'],
  };
  
  const allHealthTerms = Object.values(healthTerminology).flat();
  
  // Check if any health term is in the message
  for (const term of allHealthTerms) {
    if (input.includes(term)) {
      return true;
    }
  }
  
  // common question patterns about health
  const healthQuestionPatterns = [
    /what (is|are|should) .+/i,  // What is/are/should...
    /how (to|do|can|does) .+/i,  // How to/do/can...
    /why (do|does|is|are) .+/i,  // Why do/does/is...
    /can you .+ (about|on) .+/i, // Can you explain/tell about...
    /is it .+ to .+/i,           // Is it normal/safe/good to...
    /should i .+/i,              // Should I take/do/try...
  ];
  
  for (const pattern of healthQuestionPatterns) {
    if (input.match(pattern)) {
      // For question patterns, do a secondary check for non-health topics
      const nonHealthKeywords = [
        'game', 'movie', 'film', 'sport', 'team', 'play', 'music', 'song', 
        'politics', 'election', 'vote', 'president', 'government',
        'stock', 'market', 'invest', 'bitcoin', 'crypto', 'finance',
        'hack', 'crack', 'illegal', 'weapon', 'porn', 'gambling'
      ];
      
      // If contains both a question pattern AND a non-health keyword, reject
      if (nonHealthKeywords.some(term => input.includes(term))) {
        return false;
      }
      
      return true;
    }
  }
  
  // If it's a very short message and contains at least one number, likely health-related
  if (input.length < 15 && /\d+/.test(input)) {
    return true;
  }
  return false;
}

// Query key for chat messages
const CHAT_MESSAGES_KEY = ['healthAIChat', 'messages'];

// Service functions to work with localStorage for chat messages
const chatService = {
  getMessages: (): Message[] => {
    const saved = localStorage.getItem('healthvault-ai-chat');
    return saved ? JSON.parse(saved) : [];
  },
  
  saveMessages: (messages: Message[]): void => {
    localStorage.setItem('healthvault-ai-chat', JSON.stringify(messages));
  },
  
  clearMessages: (): void => {
    localStorage.removeItem('healthvault-ai-chat');
  }
};

const HealthAIChat: React.FC = () => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState('');
  
  // Use React Query to manage message state
  const { data: messages = [] } = useQuery({
    queryKey: CHAT_MESSAGES_KEY,
    queryFn: chatService.getMessages,
    staleTime: Infinity, // Don't refetch automatically
  });
  
  // Mutation to add a new message
  const addMessageMutation = useMutation({
    mutationFn: (newMessages: Message[]) => {
      chatService.saveMessages(newMessages);
      return Promise.resolve(newMessages);
    },
    onSuccess: (newMessages) => {
      queryClient.setQueryData(CHAT_MESSAGES_KEY, newMessages);
    },
  });
  
  // Mutation to clear messages
  const clearMessagesMutation = useMutation({
    mutationFn: () => {
      chatService.clearMessages();
      return Promise.resolve([]);
    },
    onSuccess: () => {
      queryClient.setQueryData(CHAT_MESSAGES_KEY, []);
    },
  });
  
  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    };

    // Add user message to state
    const updatedMessages = [...messages, newUserMessage];
    addMessageMutation.mutate(updatedMessages);
    
    setInputMessage('');
    
    // Client-side health topic validation
    if (!isHealthRelated(newUserMessage.text)) {
      const warningMessage: Message = {
        id: Date.now() + 1,
        text: "I can only discuss health-related topics. Please ask a question about health, wellness, medical conditions, or related subjects.",
        sender: 'ai',
        isNonHealthWarning: true
      };
      
      addMessageMutation.mutate([...updatedMessages, warningMessage]);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('healthcare-chat', {
        body: JSON.stringify({ message: newUserMessage.text })
      });

      if (error) throw error;

      const newAIMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai'
      };

      // Add AI response to state
      addMessageMutation.mutate([...updatedMessages, newAIMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, something went wrong. Please try again.',
        sender: 'ai'
      };
      
      addMessageMutation.mutate([...updatedMessages, errorMessage]);
    }
  };

  // Clear all messages
  const handleClearChat = () => {
    clearMessagesMutation.mutate();
  };

  // Loading state based on mutations
  const isLoading = addMessageMutation.isPending;

  return (
    <div className="flex flex-col h-[600px] border rounded-lg shadow-sm">
      <div className="p-3 border-b bg-blue-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Health Assistant</h2>
          <p className="text-sm text-gray-500">Ask health-related questions only</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearChat}
          className="flex items-center gap-1 text-gray-600 hover:text-red-600"
          disabled={messages.length === 0 || isLoading}
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear</span>
        </Button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 p-4">
            <p>Welcome to the Health Assistant!</p>
            <p className="text-sm mt-2">Ask any health-related questions to get started.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div 
              className={`max-w-[85%] p-4 rounded-lg shadow-sm ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : message.isNonHealthWarning
                    ? 'bg-amber-100 text-black border border-amber-300'
                    : 'bg-gray-100 text-black'
              }`}
            >
              {message.sender === 'ai' ? (
                parseMarkdown(message.text)
              ) : (
                <p>{message.text}</p>
              )}
              
              {message.isNonHealthWarning && (
                <div className="flex items-center mt-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span className="text-xs">Non-health topic detected</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 flex space-x-2">
        <Input 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a health-related question..."
          className="flex-grow"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !inputMessage.trim()}
          className="w-12 h-12 p-0"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default HealthAIChat;
