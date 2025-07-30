import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllIncomers } from "@/actions/ga/incomers";
import { IncomersForm } from "@/components/forms/ga/IncomersForm";

export default async function IncomersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const incomersResult = await getAllIncomers();
  const incomers = incomersResult.success ? incomersResult.data : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incomers Management</h1>
        <p className="text-muted-foreground">
          Manage incomers for electrical panels
        </p>
      </div>

      <IncomersForm />
    </div>
  );
}
