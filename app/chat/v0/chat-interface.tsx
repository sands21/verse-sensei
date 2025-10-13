"use client";

import { useState } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedUniverse, setSelectedUniverse] = useState("Marvel");
  const [selectedCharacter, setSelectedCharacter] = useState("Iron Man");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Iron Man. How can I assist you today?",
      role: "assistant",
      timestamp: new Date(Date.now() - 5000),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `As ${selectedCharacter} from the ${selectedUniverse} universe, I appreciate your message. This is a simulated response demonstrating the chat interface.`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Area */}
      <main
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "lg:ml-0" : "ml-0"
        )}
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages messages={messages} isTyping={isTyping} />
        </div>

        {/* Input Area */}
        <ChatInput
          selectedUniverse={selectedUniverse}
          selectedCharacter={selectedCharacter}
          onUniverseChange={setSelectedUniverse}
          onCharacterChange={setSelectedCharacter}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
}
