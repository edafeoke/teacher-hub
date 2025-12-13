"use client";

import * as React from "react";
import { ContractCard } from "./contract-card";
import type { ContractWithUsers } from "@/server-actions/contracts/get-contracts";

interface ContractListProps {
  contracts: ContractWithUsers[];
  role: "teacher" | "student";
}

export function ContractList({ contracts, role }: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No contracts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <ContractCard key={contract.id} contract={contract} role={role} />
      ))}
    </div>
  );
}

