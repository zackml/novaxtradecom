import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpFromLine, Smartphone, Copy, Info, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw — NovaX" },
      { name: "description", content: "سحب الأموال عبر Vodafone Cash، اتصالات كاش، أو InstaPay" },
    ],
  }),
  component: Withdraw,
});

type Method = "vodafone" | "etisalat" | "instapay" | "crypto";

const PAYMENT_METHODS = {
  vodafone: {
    name: "Vodafone Cash",
    color: "#e60000",
    icon: Smartphone,
    walletNumber: "010XXXXXXXXX",   // ← غير الرقم ده
    holderName: "NovaX Trading",
    instructions: [
      "افتح تطبيق Vodafone Cash",
      "اختر 'إرسال فلوس' أو 'سحب'",
      "أدخل المبلغ ورقم المحفظة أعلاه",
      "خد سكرين شوت للعملية",
    ]
  },
  etisalat: {
    name: "اتصالات كاش",
    color: "#00a650",
    icon: Smartphone,
    walletNumber: "011XXXXXXXXX",   // ← غير الرقم ده
    holderName: "NovaX Trading",
    instructions: [
      "افتح تطبيق اتصالات كاش",
      "اختر خيار التحويل",
      "أرسل المبلغ إلى الرقم أعلاه",
      "خد صورة للإيصال",
    ]
  },
  instapay: {
    name: "InstaPay",
    color: "#4f46e5",
    icon: Smartphone,
    walletNumber: "INSTAPAY_USERNAME", // أو رقم الهاتف المرتبط
    holderName: "NovaX",
    instructions: [
      "افتح تطبيق InstaPay",
      "اختر تحويل فوري",
      "أدخل الـ InstaPay ID أو رقم الهاتف أعلاه",
    ]
  },
};

function Withdraw() {
  const { user } = useAuth();
  const [method, setMethod] = useState<Method>("vodafone");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentMethod = PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS];

  const copyWallet = () => {
    if (currentMethod) {
      navigator.clipboard.writeText(currentMethod.walletNumber);
      toast.success("تم نسخ رقم المحفظة");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !amount || !phone) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setSubmitting(true);
    // هنا هتحط كود الـ Supabase insert لاحقاً
    toast.success("تم تقديم طلب السحب بنجاح - جاري المراجعة");
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-3 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
            <ArrowUpFromLine className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Withdraw</h1>
            <p className="text-muted-foreground text-sm">سحب أموالك بطرق محلية سريعة</p>
          </div>
        </div>

        {/* طرق السحب */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {Object.entries(PAYMENT_METHODS).map(([key, m]) => {
            const Icon = m.icon;
            return (
              <button
                key={key}
                onClick={() => setMethod(key as Method)}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                  method === key 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:bg-white/5"
                }`}
              >
                <div 
                  className="h-12 w-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: m.color + "30" }}
                >
                  <Icon className="h-6 w-6" style={{ color: m.color }} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">{m.name}</div>
                </div>
              </button>
            );
          })}

          {/* Crypto Option */}
          <button
            onClick={() => setMethod("crypto")}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
              method === "crypto" ? "border-primary bg-primary/10" : "border-border hover:bg-white/5"
            }`}
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              ₿
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">Crypto</div>
            </div>
          </button>
        </div>

        {method !== "crypto" ? (
          <div className="glass-strong rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <Label>أرسل إلى هذا الرقم</Label>
              <div className="mt-2 glass rounded-lg p-4 flex items-center gap-4">
                <div 
                  className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: currentMethod.color + "20", color: currentMethod.color }}
                >
                  {currentMethod.name.includes("Vodafone") ? "V" : currentMethod.name.includes("اتصالات") ? "E" : "I"}
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold font-mono tracking-wider">
                    {currentMethod.walletNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">{currentMethod.holderName}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={copyWallet}>
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="glass rounded-lg p-4 text-xs">
              <div className="flex gap-2 mb-2">
                <Info className="h-4 w-4 mt-0.5 text-accent" />
                <span className="font-medium">تعليمات السحب:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                {currentMethod.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ol>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المبلغ (EGP)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>رقم هاتفك / المرسل</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full" 
                disabled={submitting}
              >
                {submitting ? "جاري التقديم..." : "تقديم طلب السحب"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <p className="text-lg mb-4">سحب عبر العملات الرقمية قريباً</p>
            <p className="text-muted-foreground">سنضيف BTC, ETH, USDT قريباً</p>
          </div>
        )}

        <div className="mt-6 glass rounded-lg p-4 flex gap-3 text-xs text-warning">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>السحب المحلي يخضع للمراجعة اليدوية وقد يستغرق من ساعة إلى 24 ساعة.</div>
        </div>
      </main>
    </div>
  );
}
