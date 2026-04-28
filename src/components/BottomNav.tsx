import { Home, BarChart2, Wallet, User } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: "/" | "/markets" | "/portfolio" | "/dashboard";
};

const BottomNav = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: "Home", icon: <Home size={20} />, path: "/" },
    { label: "Markets", icon: <BarChart2 size={20} />, path: "/markets" },
    { label: "Portfolio", icon: <Wallet size={20} />, path: "/portfolio" },
    { label: "Account", icon: <User size={20} />, path: "/dashboard" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
      <div className="glass-strong border-t border-border/50 flex justify-around items-center py-3 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
