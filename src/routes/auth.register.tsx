import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" && search.ref.trim().length > 0 ? search.ref.trim() : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create account — NovaX" },
      { name: "description", content: "Create your NovaX account with an optional referral code." },
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
  if (!ref) {
    navigate({ to: "/" });
    return;
  }

  setInviteCode(ref);
}, [ref, navigate]);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    const code = inviteCode.trim();
    if (!code) {
      setSubmitting(false);
      toast.error("Referral code is required.");
      return;
    }

    try {
      const { data: valid, error: validateError } = await supabase.rpc("validate_invite_code", {
        _code: code,
      });

      if (validateError) {
        toast.error("Referral validation is temporarily unavailable.");
        return;
      }

      if (!valid) {
        toast.error("Invalid or expired referral code.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { display_name: displayName, invite_code: code, ref: code },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await supabase.rpc("consume_invite_code", { _code: code });
      toast.success("Account created. Please check your email to confirm your account.");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Signup is temporarily unavailable. Please try again shortly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <main className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center px-4 py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_36%)]" />
        <section className="glass-strong relative w-full max-w-md rounded-3xl p-6 shadow-elegant sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your referral link in the format /auth/register?ref=YOUR_CODE.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ref-code">Referral code</Label>
              <Input
                id="ref-code"
                required
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                className="mt-1.5"
                placeholder="YOUR_CODE"
                readOnly={!!ref}
              />
            </div>
            <div>
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
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
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5"
                placeholder="At least 8 characters"
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full rounded-full animate-cta-glow" disabled={submitting}>
              {submitting ? "Creating account…" : "Start Trading Now"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
