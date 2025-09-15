"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeName, themes } from '@/lib/theme';
import { useInvestmentData } from './use-investment-data'; // Adjust path as needed

export function InvestmentSummaryCards({ theme }: { theme: ThemeName }) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { data, loading, error } = useInvestmentData();

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-4">Loading investment data...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading data: {error.message}</div>;
  }

  if (!data) {
    return <div className="text-center py-4">No investment data available</div>;
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

  // Calculate progress percentages with proper handling
  const sipProgress = totals.sipTarget > 0 ? 
    Math.min(100, Math.round((totals.sipAchieved / totals.sipTarget) * 100)) : 0;
  const lumpsumProgress = totals.lumpsumTarget > 0 ? 
    Math.min(100, Math.round((totals.lumpsumAchieved / totals.lumpsumTarget) * 100)) : 0;

  // Determine progress bar colors based on theme
  const getProgressBarColor = (theme: ThemeName) => {
    switch(theme) {
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
      <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor}`}>
        <CardHeader>
          <CardTitle className="text-lg">SIP Summary (Yearly)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Target:</Label>
            <span className="font-medium">{formatCurrency(totals.sipTarget)}</span>
          </div>
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Achieved:</Label>
            <span className="text-primary font-medium">{formatCurrency(totals.sipAchieved)}</span>
          </div>
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Deficit:</Label>
            <span className={`font-medium ${
              totals.sipAchieved >= totals.sipTarget ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(totals.sipAchieved - totals.sipTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className={currentTheme.textColor}>Progress: {sipProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full ${progressBarColor} transition-all duration-500 ease-out`} 
                style={{ width: `${sipProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      

      {/* Lumpsum Summary - GREEN PROGRESS BAR */}
      <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor}`}>
        <CardHeader>
          <CardTitle className="text-lg">Lumpsum Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Target:</Label>
            <span className="font-medium">{formatCurrency(totals.lumpsumTarget)}</span>
          </div>
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Achieved:</Label>
            <span className="text-primary font-medium">{formatCurrency(totals.lumpsumAchieved)}</span>
          </div>
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Deficit:</Label>
            <span className={`font-medium ${
              totals.lumpsumAchieved >= totals.lumpsumTarget ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(totals.lumpsumAchieved - totals.lumpsumTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className={currentTheme.textColor}>Progress: {lumpsumProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-2.5 rounded-full bg-green-500 transition-all duration-500 ease-out" 
                style={{ width: `${lumpsumProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year Summary */}
      <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor}`}>
        <CardHeader>
          <CardTitle className="text-lg">{data.year} Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Total Target:</Label>
            <span className="font-medium">
              {formatCurrency(totals.sipTarget + totals.lumpsumTarget)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Total Achieved:</Label>
            <span className="text-primary font-medium">
              {formatCurrency(totals.sipAchieved + totals.lumpsumAchieved)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label className={currentTheme.textColor}>Overall Deficit:</Label>
            <span className={`font-medium ${
              (totals.sipAchieved + totals.lumpsumAchieved) >= 
              (totals.sipTarget + totals.lumpsumTarget) ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(
                (totals.sipAchieved + totals.lumpsumAchieved) - 
                (totals.sipTarget + totals.lumpsumTarget)
              )}
            </span>
          </div>
          <div className="pt-2 space-y-2">
            <div className="text-sm">
              <span className={`font-medium ${currentTheme.textColor}`}>Monthly SIP Target: </span>
              {formatCurrency(data.records[0]?.sipTarget || 0)}
            </div>
            <div className="text-sm">
              <span className={`font-medium ${currentTheme.textColor}`}>Annual Lumpsum Target: </span>
              {formatCurrency(data.records[0]?.lumpsumTarget || 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}