import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShieldCheck, Ticket, CheckCircle2, XCircle, Copy, Trash2, Loader2, ExternalLink,
  Users as UsersIcon, History,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — NovaX" }] }),
  component: AdminPage,
});

interface InviteCode {
  id: string;
  code: string;
  max_uses: number;
  uses: number;
  active: boolean;
  created_at: string;
}

interface DepositRow {
  id: string;
  user_id: string;
  amount: number;
  sender_phone: string;
  receipt_path: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  profiles?: { display_name: string | null; email: string | null } | null;
}

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/dashboard" });
  }, [user, isAdmin, loading, navigate]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Checking permissions…
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center gap-3 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/15 border border-warning/30">
            <ShieldCheck className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin panel</h1>
            <p className="text-muted-foreground text-sm">
              Manage invite codes and approve Vodafone Cash deposits.
            </p>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="invites">Invite codes</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersAdmin />
          </TabsContent>
          <TabsContent value="deposits">
            <DepositsAdmin />
          </TabsContent>
          <TabsContent value="invites">
            <InvitesAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DepositsAdmin() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    let q = supabase
      .from("deposits")
      .select("id, user_id, amount, sender_phone, receipt_path, status, admin_note, created_at, profiles(display_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      toast.error(error.message);
      return;
    }
    setDeposits((data as unknown as DepositRow[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function viewReceipt(path: string | null) {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 60 * 5);
    if (error || !data) {
      toast.error("Could not load receipt");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function decide(id: string, decision: "approved" | "rejected", amount: number, userId: string) {
    setBusy(id);
    try {
      const note = window.prompt(
        decision === "approved"
          ? "Optional note for the user:"
          : "Reason for rejection (optional):",
      );

      const { error: updErr } = await supabase
        .from("deposits")
        .update({
          status: decision,
          admin_note: note ?? null,
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (updErr) throw updErr;

      // Credit balance on approval
      if (decision === "approved") {
        const { data: prof } = await supabase
          .from("profiles")
          .select("balance")
          .eq("user_id", userId)
          .maybeSingle();
        const newBal = Number(prof?.balance ?? 0) + Number(amount);
        const { error: balErr } = await supabase
          .from("profiles")
          .update({ balance: newBal })
          .eq("user_id", userId);
        if (balErr) throw balErr;
      }

      toast.success(`Deposit ${decision}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition capitalize ${
              filter === f
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {deposits.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No deposits in this view.
          </div>
        ) : (
          deposits.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-border/30 last:border-0 flex-wrap"
            >
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold">
                  {d.profiles?.display_name ?? "Unknown"}{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    {d.profiles?.email}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Sent from {d.sender_phone} · {new Date(d.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-lg font-bold tabular-nums">
                ${Number(d.amount).toFixed(2)}
              </div>
              <Button
                size="sm"
                variant="glass"
                onClick={() => viewReceipt(d.receipt_path)}
                disabled={!d.receipt_path}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Receipt
              </Button>
              {d.status === "pending" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    disabled={busy === d.id}
                    onClick={() => decide(d.id, "approved", d.amount, d.user_id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busy === d.id}
                    onClick={() => decide(d.id, "rejected", d.amount, d.user_id)}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              ) : (
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    d.status === "approved"
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {d.status}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InvitesAdmin() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [maxUses, setMaxUses] = useState("1");
  const [creating, setCreating] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("invite_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setCodes((data as InviteCode[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function generateCode() {
    const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
    return `NOVA-${part()}-${part()}`;
  }

  async function create() {
    const max = parseInt(maxUses, 10);
    if (isNaN(max) || max < 1) {
      toast.error("Max uses must be at least 1");
      return;
    }
    setCreating(true);
    const code = generateCode();
    const { error } = await supabase.from("invite_codes").insert({
      code,
      max_uses: max,
      created_by: user!.id,
    });
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Invite code created");
    load();
  }

  async function toggle(id: string, active: boolean) {
    const { error } = await supabase
      .from("invite_codes")
      .update({ active: !active })
      .eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this code?")) return;
    const { error } = await supabase.from("invite_codes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}/signup?invite=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied");
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Ticket className="h-4 w-4" /> Generate new invite
        </h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1 max-w-xs">
            <Label htmlFor="max">Max uses</Label>
            <Input
              id="max"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button variant="hero" onClick={create} disabled={creating}>
            {creating ? "Creating…" : "Generate code"}
          </Button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-3 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
          {codes.length} code{codes.length === 1 ? "" : "s"}
        </div>
        {codes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No codes yet. Generate your first invite above.
          </div>
        ) : (
          codes.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-5 py-3 border-b border-border/30 last:border-0 flex-wrap"
            >
              <code className="font-mono font-semibold tracking-wider">{c.code}</code>
              <span className="text-xs text-muted-foreground">
                {c.uses} / {c.max_uses} used
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md ${
                  c.active
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {c.active ? "Active" : "Inactive"}
              </span>
              <div className="flex-1" />
              <Button size="sm" variant="ghost" onClick={() => copyLink(c.code)}>
                <Copy className="h-3.5 w-3.5" /> Link
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggle(c.id, c.active)}>
                {c.active ? "Disable" : "Enable"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface UserRow {
  user_id: string;
  display_name: string | null;
  email: string | null;
  balance: number;
  status: string;
  created_at: string;
}

interface AdjustmentRow {
  id: string;
  user_id: string;
  amount: number;
  reason: string | null;
  balance_after: number;
  created_at: string;
}

function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<AdjustmentRow[]>([]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, email, balance, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUsers((data as UserRow[]) ?? []);
  }

  async function loadHistory(userId: string) {
    const { data, error } = await supabase
      .from("balance_adjustments")
      .select("id, user_id, amount, reason, balance_after, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast.error(error.message);
      return;
    }
    setHistory((data as AdjustmentRow[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function openUser(u: UserRow) {
    setSelected(u);
    setAmount("");
    setReason("");
    loadHistory(u.user_id);
  }

  async function addProfit() {
    if (!selected) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt === 0) {
      toast.error("Enter a non-zero amount");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.rpc("admin_credit_user", {
      _user_id: selected.user_id,
      _amount: amt,
      _reason: reason.trim() || "",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Balance updated to $${Number(data).toFixed(2)}`);
    setAmount("");
    setReason("");
    setSelected({ ...selected, balance: Number(data) });
    setUsers((prev) =>
      prev.map((u) =>
        u.user_id === selected.user_id ? { ...u, balance: Number(data) } : u,
      ),
    );
    loadHistory(selected.user_id);
  }

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (u.display_name ?? "").toLowerCase().includes(s) ||
      (u.email ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Users list */}
      <div className="lg:col-span-3 glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No users found.
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {filtered.map((u) => (
              <button
                key={u.user_id}
                onClick={() => openUser(u)}
                className={`w-full text-left flex items-center gap-3 px-5 py-3 border-b border-border/30 last:border-0 transition ${
                  selected?.user_id === u.user_id
                    ? "bg-primary/10"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {u.display_name ?? "Unnamed"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.email}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground capitalize">
                  {u.status}
                </span>
                <div className="text-right">
                  <div className="font-bold tabular-nums text-sm">
                    ${Number(u.balance).toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Adjust panel */}
      <div className="lg:col-span-2 space-y-4">
        {!selected ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground text-sm">
            Select a user to adjust their balance.
          </div>
        ) : (
          <>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Selected user
              </div>
              <div className="font-semibold mt-1">
                {selected.display_name ?? "Unnamed"}
              </div>
              <div className="text-xs text-muted-foreground">
                {selected.email}
              </div>
              <div className="mt-4 text-3xl font-bold tabular-nums">
                ${Number(selected.balance).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Current balance
              </div>

              <div className="mt-5 space-y-3 pt-4 border-t border-border/50">
                <div>
                  <Label htmlFor="amt">Amount (use negative to debit)</Label>
                  <Input
                    id="amt"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Input
                    id="reason"
                    placeholder="e.g. Trading profit"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1.5"
                    maxLength={200}
                  />
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={addProfit}
                  disabled={submitting || !amount}
                >
                  {submitting ? "Applying…" : "Apply adjustment"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Leave the field empty to keep balance as-is.
                </p>
              </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <History className="h-3.5 w-3.5" /> Adjustment history
              </div>
              {history.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No adjustments yet.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="px-5 py-3 border-b border-border/30 last:border-0 flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold tabular-nums text-sm ${
                            h.amount >= 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {h.amount >= 0 ? "+" : ""}
                          ${Number(h.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {h.reason ?? "Manual adjustment"} ·{" "}
                          {new Date(h.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        bal ${Number(h.balance_after).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
