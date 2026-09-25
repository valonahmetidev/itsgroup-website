import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/CustomerLoginForm";
import { getCustomerProfile } from "@/lib/customer-profile";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("login");
}

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const profile = await getCustomerProfile();
  if (profile) redirect("/profil");

  return (
    <div className="shell py-16">
      <CustomerLoginForm />
    </div>
  );
}
