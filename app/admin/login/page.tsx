import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { Card } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <ShieldCheck className="mx-auto size-11 text-court-blue" />
          <h1 className="mt-3 text-2xl font-black">Admin Login</h1>
          <p className="mt-1 text-sm text-mutedForeground">Đăng nhập bằng Supabase Auth để quản trị giải đấu.</p>
        </div>
        <AdminLoginForm />
      </Card>
    </main>
  );
}
