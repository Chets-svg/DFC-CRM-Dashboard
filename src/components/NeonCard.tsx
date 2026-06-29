import { Shield, Users, Clock } from "lucide-react";

interface NeonCardProps {
  title: string;
  value: string;
  color: "cyan" | "fuchsia" | "green";
  icon: "shield" | "users" | "clock";
}

const colorMap = {
  cyan: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    iconBg: "bg-cyan-500/20",
    shadow: "shadow-[0_0_25px_rgba(0,255,255,0.15)]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(0,255,255,0.3)]",
    glow: "drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]",
    barColor: "bg-cyan-400",
  },
  fuchsia: {
    border: "border-fuchsia-500/40",
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-400",
    iconBg: "bg-fuchsia-500/20",
    shadow: "shadow-[0_0_25px_rgba(255,0,255,0.15)]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(255,0,255,0.3)]",
    glow: "drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]",
    barColor: "bg-fuchsia-400",
  },
  green: {
    border: "border-green-500/40",
    bg: "bg-green-500/10",
    text: "text-green-400",
    iconBg: "bg-green-500/20",
    shadow: "shadow-[0_0_25px_rgba(0,255,0,0.15)]",
    hoverShadow: "hover:shadow-[0_0_40px_rgba(0,255,0,0.3)]",
    glow: "drop-shadow-[0_0_8px_rgba(0,255,0,0.6)]",
    barColor: "bg-green-400",
  },
};

const iconMap = {
  shield: Shield,
  users: Users,
  clock: Clock,
};

export function NeonCard({ title, value, color, icon }: NeonCardProps) {
  const c = colorMap[color];
  const Icon = iconMap[icon];

  return (
    <div
      className={`relative bg-slate-900/80 border ${c.border} rounded-xl p-6 ${c.shadow} ${c.hoverShadow} transition-all duration-300 hover:scale-105 group overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${c.iconBg} border ${c.border}`}>
          <Icon size={22} className={c.text} />
        </div>
        <div className={`w-2 h-2 rounded-full ${c.barColor} ${c.glow} animate-pulse mt-2`} />
      </div>

      <p className="text-slate-500 text-xs tracking-widest font-bold mb-1">
        {title}
      </p>
      <p className={`text-2xl font-black ${c.text} ${c.glow} tracking-wider`}>
        {value}
      </p>

      <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.barColor} rounded-full transition-all duration-1000 opacity-80 group-hover:opacity-100`}
          style={{ width: `${60 + Math.random() * 35}%` }}
        />
      </div>

      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-5 bg-current" />
    </div>
  );
}