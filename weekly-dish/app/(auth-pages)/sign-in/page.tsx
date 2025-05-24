import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <form className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-block bg-blue-500 text-white rounded-full px-3 py-1 text-xs font-bold tracking-widest shadow">
            WeeklyDish
          </span>
          <h1 className="text-2xl font-extrabold text-blue-700 drop-shadow-sm">
            Sign in
          </h1>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Don't have an account?{" "}
          <Link className="text-blue-600 font-medium underline" href="/sign-up">
            Sign up
          </Link>
        </p>
        <div className="flex flex-col gap-2 mt-6">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-xs text-blue-600 underline"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
          <SubmitButton pendingText="Signing In..." formAction={signInAction}>
            Sign in
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
