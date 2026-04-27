import { Home, BarChart2, Wallet, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { label: "لوحة التحكم", icon: <Home size={20} />, path: "/" },
    { label: "التداول", icon: <BarChart2 size={20} />, path: "/trade" },
    { label: "المحفظة", icon: <Wallet size={20} />, path: "/wallet" },
    { label: "الإعدادات", icon: <User size={20} />, path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
      <div className="bg-[#0a0e14]/80 backdrop-blur-lg border-t border-white/10 flex justify-around items-center py-3 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? "text-[#22c55e]" : "text-gray-400"
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
