
import React from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import HealthAIChat from "@/components/HealthAIChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AIChat: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Health Assistant</h1>
            <p className="text-muted-foreground mt-2">
              Get instant, AI-powered health insights and advice
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Chat with AI Health Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthAIChat />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AIChat;
