"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeName, themes } from '@/lib/theme';
import { useInvestmentData } from './use-investment-data';

export function InvestmentSummaryCards({ theme }: { theme: ThemeName }) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { data, loading, error } = useInvestmentData();
  const neon = theme === 'neon-cyberpunk';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`text-center py-4 ${
        neon ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]' : ''
      }`}>
        Loading investment data...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-4 ${
        neon ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-red-500'
      }`}>
        Error loading data: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`text-center py-4 ${
        neon ? 'text-slate-400' : ''
      }`}>
        No investment data available
      </div>
    );
  }

  const calculateTotals = () => {
    const monthlySipTarget = data.records[0]?.sipTarget || 0;
    return {
      sipTarget: monthlySipTarget * 12,
      lumpsumTarget: data.records.reduce((sum, record) => sum + (record.lumpsumTarget || 0), 0),
      sipAchieved: data.records.reduce((sum, record) => sum + (record.sipAchieved || 0), 0),
      lumpsumAchieved: data.records.reduce((sum, record) => sum + (record.lumpsumAchieved || 0), 0),
    };
  };

  const totals = calculateTotals();

  const sipProgress = totals.sipTarget > 0 ? 
    Math.min(100, Math.round((totals.sipAchieved / totals.sipTarget) * 100)) : 0;
  const lumpsumProgress = totals.lumpsumTarget > 0 ? 
    Math.min(100, Math.round((totals.lumpsumAchieved / totals.lumpsumTarget) * 100)) : 0;

  const getProgressBarColor = (theme: ThemeName) => {
    switch(theme) {
      case 'neon-cyberpunk':
        return 'bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.6)]';
      case 'dark':
        return 'bg-blue-400';
      case 'midnight':
        return 'bg-purple-500';
      case 'sunset':
        return 'bg-orange-500';
      case 'forest':
        return 'bg-green-500';
      case 'ocean':
        return 'bg-teal-500';
      default:
        return 'bg-blue-500';
    }
  };

  const progressBarColor = getProgressBarColor(theme);

  // Neon-specific progress bar colors
  const neonSipBarColor = 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.6)]';
  const neonLumpsumBarColor = 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* SIP Summary */}
      <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor} ${
        neon ? 'border-cyan-500/25 shadow-[0_0_25px_rgba(0,255,255,0.08)]' : ''
      }`}>
        <CardHeader>
          <CardTitle className={`text-lg ${
            neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''
          }`}>
            SIP Summary (Yearly)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(0,255,255,0.1)]' : ''
            }`}>Target:</Label>
            <span className={`font-medium ${
              neon ? 'text-cyan-100 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' : ''
            }`}>{formatCurrency(totals.sipTarget)}</span>
          </div>
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(0,255,255,0.1)]' : ''
            }`}>Achieved:</Label>
            <span className={`text-primary font-medium ${
              neon ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]' : ''
            }`}>{formatCurrency(totals.sipAchieved)}</span>
          </div>
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(0,255,255,0.1)]' : ''
            }`}>Deficit:</Label>
            <span className={`font-medium ${
              totals.sipAchieved >= totals.sipTarget 
                ? neon 
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                  : 'text-green-500' 
                : neon 
                  ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' 
                  : 'text-red-500'
            }`}>
              {formatCurrency(totals.sipAchieved - totals.sipTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className={`${currentTheme.textColor} ${
                neon ? 'text-slate-400' : ''
              }`}>Progress: <span className={
                neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''
              }>{sipProgress}%</span></span>
            </div>
            <div className={`w-full rounded-full h-2.5 overflow-hidden ${
              neon ? 'bg-slate-800 border border-cyan-500/15' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                  neon ? neonSipBarColor : progressBarColor
                }`} 
                style={{ width: `${sipProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      

      {/* Lumpsum Summary */}
      <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor} ${
        neon ? 'border-emerald-500/25 shadow-[0_0_25px_rgba(52,211,153,0.08)]' : ''
      }`}>
        <CardHeader>
          <CardTitle className={`text-lg ${
            neon ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : ''
          }`}>
            Lumpsum Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.1)]' : ''
            }`}>Target:</Label>
            <span className={`font-medium ${
              neon ? 'text-emerald-100 drop-shadow-[0_0_4px_rgba(52,211,153,0.2)]' : ''
            }`}>{formatCurrency(totals.lumpsumTarget)}</span>
          </div>
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.1)]' : ''
            }`}>Achieved:</Label>
            <span className={`text-primary font-medium ${
              neon ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]' : ''
            }`}>{formatCurrency(totals.lumpsumAchieved)}</span>
          </div>
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.1)]' : ''
            }`}>Deficit:</Label>
            <span className={`font-medium ${
              totals.lumpsumAchieved >= totals.lumpsumTarget 
                ? neon 
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                  : 'text-green-500' 
                : neon 
                  ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' 
                  : 'text-red-500'
            }`}>
              {formatCurrency(totals.lumpsumAchieved - totals.lumpsumTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className={`${currentTheme.textColor} ${
                neon ? 'text-slate-400' : ''
              }`}>Progress: <span className={
                neon ? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]' : ''
              }>{lumpsumProgress}%</span></span>
            </div>
            <div className={`w-full rounded-full h-2.5 overflow-hidden ${
              neon ? 'bg-slate-800 border border-emerald-500/15' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                  neon ? neonLumpsumBarColor : 'bg-green-500'
                }`} 
                style={{ width: `${lumpsumProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year Summary */}
      <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor} ${
        neon ? 'border-violet-500/25 shadow-[0_0_25px_rgba(139,92,246,0.08)]' : ''
      }`}>
        <CardHeader>
          <CardTitle className={`text-lg ${
            neon ? 'text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]' : ''
          }`}>
            {data.year} Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(139,92,246,0.1)]' : ''
            }`}>Total Target:</Label>
            <span className={`font-medium ${
              neon ? 'text-violet-100 drop-shadow-[0_0_4px_rgba(139,92,246,0.2)]' : ''
            }`}>
              {formatCurrency(totals.sipTarget + totals.lumpsumTarget)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(139,92,246,0.1)]' : ''
            }`}>Total Achieved:</Label>
            <span className={`text-primary font-medium ${
              neon ? 'text-violet-300 drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]' : ''
            }`}>
              {formatCurrency(totals.sipAchieved + totals.lumpsumAchieved)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={`${currentTheme.textColor} ${
              neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(139,92,246,0.1)]' : ''
            }`}>Overall Deficit:</Label>
            <span className={`font-medium ${
              (totals.sipAchieved + totals.lumpsumAchieved) >= 
              (totals.sipTarget + totals.lumpsumTarget) 
                ? neon 
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                  : 'text-green-500' 
                : neon 
                  ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' 
                  : 'text-red-500'
            }`}>
              {formatCurrency(
                (totals.sipAchieved + totals.lumpsumAchieved) - 
                (totals.sipTarget + totals.lumpsumTarget)
              )}
            </span>
          </div>
          <div className="pt-2 space-y-2">
            <div className={`text-sm ${
              neon ? 'text-slate-300' : ''
            }`}>
              <span className={`font-medium ${currentTheme.textColor} ${
                neon ? 'text-slate-400' : ''
              }`}>Monthly SIP Target: </span>
              <span className={neon ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''}>
                {formatCurrency(data.records[0]?.sipTarget || 0)}
              </span>
            </div>
            <div className={`text-sm ${
              neon ? 'text-slate-300' : ''
            }`}>
              <span className={`font-medium ${currentTheme.textColor} ${
                neon ? 'text-slate-400' : ''
              }`}>Annual Lumpsum Target: </span>
              <span className={neon ? 'text-emerald-300 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]' : ''}>
                {formatCurrency(data.records[0]?.lumpsumTarget || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}