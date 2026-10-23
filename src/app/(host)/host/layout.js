import RoleGuard from "@/components/RoleGuard";

export default function HostLayout({ children }) {
  return <RoleGuard role="owner">{children}</RoleGuard>;
}
