"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeName, themes, isNeon } from '@/lib/theme';
import { useInvestmentData } from './use-investment-data';

export function InvestmentSummaryCards({ theme }: { theme: ThemeName }) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { data, loading, error } = useInvestmentData();
  const neon = isNeon(theme);

  const {
    textColor,
    cardBg,
    borderColor,
    highlightBg,
  } = currentTheme;

  // ─── Neon Styles Object (Consistent with InvestmentTracker) ──────────
  const ns = neon ? {
    sipCard: 'border-cyan-500/25 shadow-[0_0_25px_rgba(0,255,255,0.08)]',
    lumpCard: 'border-emerald-500/25 shadow-[0_0_25px_rgba(52,211,153,0.08)]',
    yearCard: 'border-violet-500/25 shadow-[0_0_25px_rgba(139,92,246,0.08)]',
    sipTitle: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]',
    lumpTitle: 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]',
    yearTitle: 'text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]',
    label: 'text-slate-400 drop-shadow-[0_0_2px_rgba(0,255,255,0.1)]',
    sipValue: 'text-cyan-100 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]',
    lumpValue: 'text-emerald-100 drop-shadow-[0_0_4px_rgba(52,211,153,0.2)]',
    yearValue: 'text-violet-100 drop-shadow-[0_0_4px_rgba(139,92,246,0.2)]',
    sipPrimary: 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]',
    lumpPrimary: 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]',
    yearPrimary: 'text-violet-300 drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]',
    progressTrack: 'bg-slate-800 border border-cyan-500/15',
    lumpProgressTrack: 'bg-slate-800 border border-emerald-500/15',
    yearProgressTrack: 'bg-slate-800 border border-violet-500/15',
    sipBar: 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.6)]',
    lumpBar: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]',
    yearBar: 'bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.6)]',
    deficitPositive: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    deficitNegative: 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]',
    sipProgressPct: 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]',
    lumpProgressPct: 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]',
    yearProgressPct: 'text-violet-400 drop-shadow-[0_0_4px_rgba(139,92,246,0.3)]',
    textSlate300: 'text-slate-300',
    textSlate400: 'text-slate-400',
    monthlySipValue: 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]',
    monthlyLumpValue: 'text-emerald-300 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]',
  } : {};

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
      <div className={`text-center py-4 rounded-xl ${
        neon ? 'text-red-400 bg-red-500/10 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-red-500'
      }`}>
        Error loading data: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`text-center py-4 rounded-xl ${
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

  const totalTarget = totals.sipTarget + totals.lumpsumTarget;
  const totalAchieved = totals.sipAchieved + totals.lumpsumAchieved;

  const sipProgress = totals.sipTarget > 0 ? 
    Math.min(100, Math.round((totals.sipAchieved / totals.sipTarget) * 100)) : 0;
  const lumpsumProgress = totals.lumpsumTarget > 0 ? 
    Math.min(100, Math.round((totals.lumpsumAchieved / totals.lumpsumTarget) * 100)) : 0;
  const overallProgress = totalTarget > 0 ? 
    Math.min(100, Math.round((totalAchieved / totalTarget) * 100)) : 0;

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* SIP Summary */}
      <Card className={`rounded-xl ${highlightBg} ${borderColor} ${neon ? ns.sipCard : ''}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${neon ? ns.sipTitle : ''}`}>
            SIP Summary (Yearly)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Target:</Label>
            <span className={`font-medium ${neon ? ns.sipValue : ''}`}>
              {formatCurrency(totals.sipTarget)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Achieved:</Label>
            <span className={`text-primary font-medium ${neon ? ns.sipPrimary : ''}`}>
              {formatCurrency(totals.sipAchieved)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Deficit:</Label>
            <span className={`font-medium ${
              totals.sipAchieved >= totals.sipTarget 
                ? (neon ? ns.deficitPositive : 'text-green-500')
                : (neon ? ns.deficitNegative : 'text-red-500')
            }`}>
              {formatCurrency(totals.sipAchieved - totals.sipTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className={neon ? ns.label : textColor}>
                Progress: <span className={neon ? ns.sipProgressPct : ''}>{sipProgress}%</span>
              </span>
            </div>
            <div className={`w-full rounded-full h-3 overflow-hidden ${neon ? ns.progressTrack : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${neon ? ns.sipBar : progressBarColor}`} 
                style={{ width: `${sipProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      

      {/* Lumpsum Summary */}
      <Card className={`rounded-xl ${highlightBg} ${borderColor} ${neon ? ns.lumpCard : ''}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${neon ? ns.lumpTitle : ''}`}>
            Lumpsum Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Target:</Label>
            <span className={`font-medium ${neon ? ns.lumpValue : ''}`}>
              {formatCurrency(totals.lumpsumTarget)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Achieved:</Label>
            <span className={`text-primary font-medium ${neon ? ns.lumpPrimary : ''}`}>
              {formatCurrency(totals.lumpsumAchieved)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Deficit:</Label>
            <span className={`font-medium ${
              totals.lumpsumAchieved >= totals.lumpsumTarget 
                ? (neon ? ns.deficitPositive : 'text-green-500')
                : (neon ? ns.deficitNegative : 'text-red-500')
            }`}>
              {formatCurrency(totals.lumpsumAchieved - totals.lumpsumTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className={neon ? ns.label : textColor}>
                Progress: <span className={neon ? ns.lumpProgressPct : ''}>{lumpsumProgress}%</span>
              </span>
            </div>
            <div className={`w-full rounded-full h-3 overflow-hidden ${neon ? ns.lumpProgressTrack : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${neon ? ns.lumpBar : 'bg-green-500'}`} 
                style={{ width: `${lumpsumProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year Summary */}
      <Card className={`rounded-xl ${highlightBg} ${borderColor} ${neon ? ns.yearCard : ''}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${neon ? ns.yearTitle : ''}`}>
            {data.year} Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Total Target:</Label>
            <span className={`font-medium ${neon ? ns.yearValue : ''}`}>
              {formatCurrency(totalTarget)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Total Achieved:</Label>
            <span className={`text-primary font-medium ${neon ? ns.yearPrimary : ''}`}>
              {formatCurrency(totalAchieved)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={neon ? ns.label : textColor}>Overall Deficit:</Label>
            <span className={`font-medium ${
              totalAchieved >= totalTarget
                ? (neon ? ns.deficitPositive : 'text-green-500')
                : (neon ? ns.deficitNegative : 'text-red-500')
            }`}>
              {formatCurrency(totalAchieved - totalTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className={neon ? ns.label : textColor}>
                Overall Progress: <span className={neon ? ns.yearProgressPct : ''}>{overallProgress}%</span>
              </span>
            </div>
            <div className={`w-full rounded-full h-3 overflow-hidden ${neon ? ns.yearProgressTrack : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${neon ? ns.yearBar : 'bg-purple-500'}`} 
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <div className="pt-2 space-y-2">
            <div className={`text-sm ${neon ? ns.textSlate300 : ''}`}>
              <span className={`font-medium ${neon ? ns.label : textColor}`}>Monthly SIP Target: </span>
              <span className={neon ? ns.monthlySipValue : ''}>
                {formatCurrency(data.records[0]?.sipTarget || 0)}
              </span>
            </div>
            <div className={`text-sm ${neon ? ns.textSlate300 : ''}`}>
              <span className={`font-medium ${neon ? ns.label : textColor}`}>Annual Lumpsum Target: </span>
              <span className={neon ? ns.monthlyLumpValue : ''}>
                {formatCurrency(data.records[0]?.lumpsumTarget || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}