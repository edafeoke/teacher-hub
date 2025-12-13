"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import type { ContractWithUsers } from "@/server-actions/contracts/get-contracts";
import Link from "next/link";

interface ContractCardProps {
  contract: ContractWithUsers;
  role: "teacher" | "student";
}

export function ContractCard({ contract, role }: ContractCardProps) {
  const otherUser = role === "teacher" ? contract.student : contract.teacher;
  const initials = otherUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getStatusBadge = () => {
    switch (contract.status) {
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "COMPLETED":
        return <Badge variant="outline">Completed</Badge>;
      case "TERMINATED":
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{contract.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {role === "teacher" ? "Student" : "Teacher"}: {otherUser.name}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contract.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{contract.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">${contract.totalAmount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Rate:</span>
            <span className="font-medium">${contract.hourlyRate}/hr</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Hours:</span>
            <span className="font-medium">{contract.totalHours}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Start:</span>
            <span className="font-medium">{format(new Date(contract.startDate), "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button asChild variant="outline" size="sm">
            <Link href={`/contracts/${contract.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

