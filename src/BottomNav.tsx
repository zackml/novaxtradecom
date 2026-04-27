import { Link } from "@tanstack/react-router";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
      <div className="bg-[#0a0e14]/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center py-4 px-2">
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 [&.active]:text-[#22c55e]">
          <span className="text-xs">الرئيسية</span>
        </Link>
        <Link to="/trade" className="flex flex-col items-center gap-1 text-gray-400 [&.active]:text-[#22c55e]">
          <span className="text-xs">التداول</span>
        </Link>
        <Link to="/wallet" className="flex flex-col items-center gap-1 text-gray-400 [&.active]:text-[#22c55e]">
          <span className="text-xs">المحفظة</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center gap-1 text-gray-400 [&.active]:text-[#22c55e]">
          <span className="text-xs">الإعدادات</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
