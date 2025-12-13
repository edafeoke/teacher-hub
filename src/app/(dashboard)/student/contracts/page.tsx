import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getContracts } from "@/server-actions/contracts/get-contracts";
import { ContractList } from "@/components/contracts/contract-list";

export default async function StudentContractsPage() {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.studentProfile) {
    redirect("/onboarding");
  }

  const result = await getContracts({
    userId: session.user.id,
    role: "student",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Contracts</h1>
        <p className="text-muted-foreground mt-2">
          Manage your learning contracts
        </p>
      </div>

      {!result.success ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{result.error || "Failed to load contracts"}</p>
        </div>
      ) : (
        <ContractList contracts={result.contracts || []} role="student" />
      )}
    </div>
  );
}

