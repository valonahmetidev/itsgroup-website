import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/CustomerLoginForm";
import { getCustomerProfile } from "@/lib/customer-profile";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const profile = await getCustomerProfile();
  if (profile) redirect("/katalog");

  return (
    <div className="shell py-16">
      <CustomerLoginForm />
    </div>
  );
}
