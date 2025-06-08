import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: any; // 型をanyまたは適切な型に
}) {
  // searchParamsをawaitしてオブジェクトとして扱う
  const params = await searchParams;

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <form className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-block bg-blue-500 text-white rounded-full px-3 py-1 text-xs font-bold tracking-widest shadow">
            WeeklyDish
          </span>
          <h1 className="text-2xl font-extrabold text-blue-700 drop-shadow-sm">
            Reset Password
          </h1>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Already have an account?{" "}
          <Link className="text-blue-600 underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 mt-6">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            Reset Password
          </SubmitButton>
          <FormMessage message={params} />
        </div>
      </form>
      <SmtpMessage />
    </div>
  );
}
