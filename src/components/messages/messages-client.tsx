"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Send,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    read: boolean;
  } | null;
  unreadCount: number;
  messages: Message[];
}

interface MessagesClientProps {
  currentUserId: string;
}

// Mock data - replace with real data from database
const mockConversations: Conversation[] = [
  {
    id: "1",
    participant: {
      id: "user2",
      name: "Dr. Sarah Johnson",
      email: "sarah@example.com",
      image: null,
    },
    lastMessage: {
      content: "Thank you for the session! I'll see you next week.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        content: "Hello! I'm interested in booking a session.",
        senderId: "user2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true,
      },
      {
        id: "m2",
        content: "Great! What time works best for you?",
        senderId: "current",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
        read: true,
      },
      {
        id: "m3",
        content: "How about Tuesday at 3 PM?",
        senderId: "user2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
        read: true,
      },
      {
        id: "m4",
        content: "That works perfectly! I'll send you the meeting link.",
        senderId: "current",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1 + 1000 * 60 * 2),
        read: true,
      },
      {
        id: "m5",
        content: "Thank you for the session! I'll see you next week.",
        senderId: "user2",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: true,
      },
    ],
  },
  {
    id: "2",
    participant: {
      id: "user3",
      name: "Michael Chen",
      email: "michael@example.com",
      image: null,
    },
    lastMessage: {
      content: "Can we schedule a follow-up session?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      read: false,
    },
    unreadCount: 2,
    messages: [
      {
        id: "m6",
        content: "Hi, I'd like to discuss my progress.",
        senderId: "user3",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        read: true,
      },
      {
        id: "m7",
        content: "Of course! How have you been doing with the exercises?",
        senderId: "current",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3 + 1000 * 60 * 10),
        read: true,
      },
      {
        id: "m8",
        content: "I've been practicing daily. Can we schedule a follow-up session?",
        senderId: "user3",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        read: false,
      },
    ],
  },
  {
    id: "3",
    participant: {
      id: "user4",
      name: "Emily Rodriguez",
      email: "emily@example.com",
      image: null,
    },
    lastMessage: {
      content: "Looking forward to our session!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
    unreadCount: 0,
    messages: [
      {
        id: "m9",
        content: "Hello! I saw your profile and I'm very interested.",
        senderId: "user4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
        read: true,
      },
      {
        id: "m10",
        content: "Thank you! I'd be happy to help. What would you like to learn?",
        senderId: "current",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 15),
        read: true,
      },
      {
        id: "m11",
        content: "Looking forward to our session!",
        senderId: "user4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
      },
    ],
  },
];

function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, "HH:mm");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMM d");
  }
}

function formatConversationTime(date: Date): string {
  if (isToday(date)) {
    return format(date, "HH:mm");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMM d, yyyy");
  }
}

export function MessagesClient({ currentUserId }: MessagesClientProps) {
  const [conversations] = React.useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(
    conversations[0] || null
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [messageInput, setMessageInput] = React.useState("");

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) =>
      conv.participant.name.toLowerCase().includes(query) ||
      conv.participant.email.toLowerCase().includes(query) ||
      conv.lastMessage?.content.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    // In a real app, this would send to the server
    console.log("Sending message:", messageInput);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] border rounded-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-muted/30">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark all as read</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const initials = conversation.participant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const isSelected = selectedConversation?.id === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 hover:bg-muted/50 transition-colors text-left ${
                      isSelected ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={conversation.participant.image || undefined}
                          alt={conversation.participant.name}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">
                            {conversation.participant.name}
                          </h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatConversationTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content || "No messages yet"}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedConversation.participant.image || undefined}
                    alt={selectedConversation.participant.name}
                  />
                  <AvatarFallback>
                    {selectedConversation.participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{selectedConversation.participant.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.participant.email}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((message) => {
                  const isOwnMessage = message.senderId === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8 mt-auto">
                          <AvatarImage
                            src={selectedConversation.participant.image || undefined}
                            alt={selectedConversation.participant.name}
                          />
                          <AvatarFallback>
                            {selectedConversation.participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                        <Card
                          className={`px-4 py-2 ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </Card>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground px-1">
                          <span>{formatMessageTime(message.timestamp)}</span>
                          {isOwnMessage && (
                            <span>
                              {message.read ? (
                                <CheckCheck className="h-3 w-3 inline" />
                              ) : (
                                <Check className="h-3 w-3 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

