"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Search,
  MoreVertical,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConversationWithParticipant } from "@/server-actions/messages/conversations";
import type { MessageWithAttachments } from "@/server-actions/messages/messages";
import { MessageInput } from "./message-input";
import { MessageBubble } from "./message-bubble";
import { toast } from "sonner";

// SWR fetchers
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MessagesClientProps {
  currentUserId: string;
}

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationParam = searchParams.get("conversation");
  
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(conversationParam);
  const [selectedConversation, setSelectedConversation] = React.useState<ConversationWithParticipant | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Use SWR for conversations with real-time revalidation
  const { data: conversations = [], mutate: mutateConversations, isLoading: isLoadingConversations } = useSWR<ConversationWithParticipant[]>(
    "/api/messages/conversations",
    fetcher,
    {
      refreshInterval: 2000, // Revalidate every 2 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Use SWR for messages with real-time revalidation
  const { data: messagesData, mutate: mutateMessages, isLoading: isLoadingMessages } = useSWR<{ messages: MessageWithAttachments[]; hasMore: boolean }>(
    selectedConversationId ? `/api/messages/${selectedConversationId}?page=${currentPage}&limit=50` : null,
    fetcher,
    {
      refreshInterval: 1000, // Revalidate every 1 second for messages
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const messages = messagesData?.messages || [];
  const hasMoreMessages = messagesData?.hasMore || false;

  // Handle conversation param and initial selection
  React.useEffect(() => {
    if (conversationParam && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationParam);
      if (conversation) {
        setSelectedConversationId(conversation.id);
        setSelectedConversation(conversation);
        router.replace("/messages");
      } else {
        // Conversation not found, try to fetch it directly
        setSelectedConversationId(conversationParam);
        (async () => {
          try {
            const response = await fetch(`/api/messages/conversations`);
            const allConversations = await response.json();
            const found = Array.isArray(allConversations)
              ? allConversations.find((c: ConversationWithParticipant) => c.id === conversationParam)
              : null;
            
            if (found) {
              setSelectedConversation(found);
              mutateConversations([found, ...conversations], false);
            }
          } catch (err) {
            console.error("Error fetching conversation:", err);
          }
        })();
        router.replace("/messages");
      }
    } else if (!selectedConversationId && conversations.length > 0) {
      // Auto-select first conversation if none selected
      setSelectedConversationId(conversations[0].id);
      setSelectedConversation(conversations[0]);
    }
  }, [conversationParam, conversations, router, mutateConversations, selectedConversationId]);

  // Mark messages as read when conversation is selected
  React.useEffect(() => {
    if (!selectedConversationId || messages.length === 0) return;

    fetch(`/api/messages/${selectedConversationId}/read`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => {
        // Update conversation unread count
        mutateConversations(
          conversations.map((conv) =>
            conv.id === selectedConversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          ),
          false
        );
      })
      .catch((err) => {
        console.error("Error marking messages as read:", err);
      });
  }, [selectedConversationId, messages.length, conversations, mutateConversations]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Update selected conversation when conversations list updates
  React.useEffect(() => {
    if (selectedConversationId && conversations.length > 0) {
      const updated = conversations.find((c) => c.id === selectedConversationId);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations, selectedConversationId]);

  const filteredConversations = React.useMemo(() => {
    // Ensure conversations is always an array
    const conversationsList = Array.isArray(conversations) ? conversations : [];
    
    if (!searchQuery.trim()) {
      return conversationsList;
    }
    const query = searchQuery.toLowerCase();
    return conversationsList.filter(
      (conv) =>
        conv.participant?.name?.toLowerCase().includes(query) ||
        conv.participant?.email?.toLowerCase().includes(query) ||
        conv.lastMessage?.content?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const handleSelectConversation = (conversation: ConversationWithParticipant) => {
    setSelectedConversationId(conversation.id);
    setSelectedConversation(conversation);
    setCurrentPage(1);
    // SWR will automatically reload messages when the key changes
  };

  const handleSendMessage = async (
    content: string,
    messageType: "TEXT" | "AUDIO" | "VIDEO" | "FILE" | "IMAGE" | "EMOJI",
    attachments?: Array<{
      fileUrl: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      thumbnailUrl?: string;
      duration?: number;
    }>
  ) => {
    if (!selectedConversationId) return;

    // Create optimistic message for immediate UI update
    const optimisticMessage: MessageWithAttachments = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      content: content || null,
      messageType: messageType as any,
      status: "SENT",
      timestamp: new Date(),
      attachments: attachments?.map((att, idx) => ({
        id: `temp-att-${Date.now()}-${idx}`,
        fileUrl: att.fileUrl,
        fileName: att.fileName,
        fileType: att.fileType,
        fileSize: att.fileSize,
        thumbnailUrl: att.thumbnailUrl || null,
        duration: att.duration || null,
      })) || [],
    };

    // Optimistically update messages
    mutateMessages(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          messages: [...current.messages, optimisticMessage],
        };
      },
      false
    );

    try {
      const response = await fetch(`/api/messages/${selectedConversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content || undefined,
          messageType,
          attachments: attachments?.map((att) => ({
            fileUrl: att.fileUrl,
            fileName: att.fileName,
            fileType: att.fileType,
            fileSize: att.fileSize,
            thumbnailUrl: att.thumbnailUrl,
            duration: att.duration,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      if (result.message) {
        // Replace optimistic message with real one
        mutateMessages(
          (current) => {
            if (!current) return current;
            return {
              ...current,
              messages: current.messages.map((msg) =>
                msg.id === optimisticMessage.id ? result.message : msg
              ),
            };
          },
          false
        );

        // Update conversation last message
        mutateConversations(
          (current) => {
            if (!current) return current;
            return current.map((conv) =>
              conv.id === selectedConversationId
                ? {
                    ...conv,
                    lastMessage: {
                      content: result.message.content || `[${messageType}]`,
                      timestamp: result.message.timestamp,
                      read: false,
                    },
                  }
                : conv
            );
          },
          false
        );

        // Trigger revalidation to get latest data
        mutateMessages();
        mutateConversations();
      }
    } catch (error) {
      // Rollback optimistic update on error
      mutateMessages(
        (current) => {
          if (!current) return current;
          return {
            ...current,
            messages: current.messages.filter(
              (msg) => msg.id !== optimisticMessage.id
            ),
          };
        },
        false
      );

      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedConversationId || !hasMoreMessages || isLoadingMessages) return;

    const nextPage = currentPage + 1;
    
    // Fetch the next page
    try {
      const response = await fetch(
        `/api/messages/${selectedConversationId}?page=${nextPage}&limit=50`
      );
      const result = await response.json();

      if (response.ok && result.messages) {
        // Update messages with new page data using SWR mutate
        mutateMessages(
          (current) => {
            if (!current) return current;
            return {
              messages: [...result.messages, ...current.messages],
              hasMore: result.hasMore || false,
            };
          },
          false
        );
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
      toast.error("Failed to load more messages");
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
          {isLoadingConversations ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
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

                  const isSelected = selectedConversationId === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
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
          )}
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
              {isLoadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {hasMoreMessages && (
                    <div className="flex justify-center mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadMoreMessages}
                        disabled={isLoadingMessages}
                      >
                        {isLoadingMessages ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Load older messages
                      </Button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {messages.map((message) => {
                      // Ensure both are strings for comparison
                      const isOwnMessage = String(message.senderId) === String(currentUserId);
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isOwnMessage && (
                            <Avatar className="h-8 w-8 mt-auto flex-shrink-0">
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
                          {isOwnMessage && (
                            <div className="w-8 flex-shrink-0" /> // Spacer for alignment
                          )}
                          <MessageBubble
                            id={message.id}
                            content={message.content}
                            messageType={message.messageType}
                            status={message.status}
                            timestamp={message.timestamp}
                            attachments={message.attachments}
                            isOwnMessage={isOwnMessage}
                          />
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </div>

            {/* Message Input */}
            <MessageInput onSend={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Select a conversation</p>
              <p className="text-sm">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
