import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({ children }) {
  return <RoleGuard role="admin">{children}</RoleGuard>;
}
