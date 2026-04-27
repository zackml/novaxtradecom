import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const searchSchema = z.object({
  ref: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/auth/register")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Create account — NovaX" },
      { name: "description", content: "Sign up for NovaX with your invite code." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { ref } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(ref ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ref) setInviteCode(ref);
  }, [ref]);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const code = inviteCode.trim();
    if (!code) {
      setSubmitting(false);
      toast.error("Invite code is required.");
      return;
    }

    // Validate invite code against Supabase
    const { data: valid, error: validateError } = await supabase.rpc(
      "validate_invite_code",
      { _code: code },
    );

    if (validateError) {
      setSubmitting(false);
      toast.error(validateError.message);
      return;
    }
    if (!valid) {
      setSubmitting(false);
      toast.error("Invalid or expired invite code.");
      return;
    }

    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: displayName, invite_code: code },
      },
    });

    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    // Consume invite code (best-effort; ignore errors so signup still succeeds)
    const { error: consumeError } = await supabase.rpc("consume_invite_code", {
      _code: code,
    });
    if (consumeError) {
      console.warn("Failed to consume invite code:", consumeError.message);
    }

    setSubmitting(false);
    toast.success("Account created! Welcome to NovaX.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass-strong rounded-2xl p-8 shadow-elegant animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary mb-3">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Join NovaX and start trading.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="invite">Invite code</Label>
              <Input
                id="invite"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="mt-1.5"
                placeholder="Your invite code"
                readOnly={!!ref}
              />
            </div>
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1.5"
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                placeholder="At least 8 characters"
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
