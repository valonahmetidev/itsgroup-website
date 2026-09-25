import { redirect } from "next/navigation";
import { customerListProformas } from "@/app/customer/actions";
import { ProfileView } from "@/components/ProfileView";
import { getCustomerProfile } from "@/lib/customer-profile";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("profile");
}

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCustomerProfile();
  if (!profile) redirect("/najava");

  const proformasResult = await customerListProformas();
  const proformas = proformasResult.ok ? proformasResult.items : [];

  return (
    <ProfileView
      profile={{
        name: profile.name,
        email: profile.email,
        discountPercent: profile.discountPercent,
      }}
      proformas={proformas}
    />
  );
}
