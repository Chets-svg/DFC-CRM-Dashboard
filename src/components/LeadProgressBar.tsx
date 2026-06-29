"use client";

import React from 'react';
import { ArrowRight, Check, CreditCard, FileSignature, FileText, Shield, ThumbsUp, User } from "lucide-react";
import { motion } from 'framer-motion';
import { ThemeName, themes } from '@/lib/theme';

interface Stage {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  actionLink?: string;
}

interface LeadProgressBarProps {
  status?: string;
  onStatusChange?: (newStatus: string) => void;
  themeName?: ThemeName;
  isLost?: boolean;
  productInterest?: string[];
}

export default function LeadProgressBar({ 
  status = 'lead-generated', 
  onStatusChange,
  themeName = 'blue-smoke',
  isLost = false
}: LeadProgressBarProps) {
  const neon = themeName === 'neon-cyberpunk';
  const currentTheme = themes[themeName] || themes['blue-smoke'];
  const { cardBg, borderColor, highlightBg, selectedBg, mutedText, inputBg, buttonBg, textColor } = currentTheme;

  const stages: Stage[] = [
    { 
      id: 'lead-generated', 
      label: 'Generated', 
      icon: <User className="w-5 h-5" />,
      description: 'Lead has been created in the system',
      actionLink: 'https://www.cvlkra.com/'
    },
    { 
      id: 'Kyc-Status', 
      label: 'KYC Status', 
      icon: <Shield className="w-5 h-5" />,
      description: 'KYC verification status check',
      actionLink: 'https://www.cvlkra.com/'
    },
    { 
      id: 'kyc-started', 
      label: 'KYC Started', 
      icon: <FileText className="w-5 h-5" />,
      description: 'KYC process initiated - verification required',
      actionLink: 'https://edge360.camsonline.com/signin', 
    },
    { 
      id: 'kyc-completed', 
      label: 'KYC Done', 
      icon: <Check className="w-5 h-5" />,
      description: 'KYC documents verified and approved',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'can-no-generated', 
      label: 'CAN No.', 
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Client Account Number generated',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'can-account-created', 
      label: 'CAN Account', 
      icon: <Check className="w-5 h-5" />,
      description: 'Investment account created',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'mandate-generated', 
      label: 'Mandate', 
      icon: <FileSignature className="w-5 h-5" />,
      description: 'Auto-debit mandate generated',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'mandate-accepted', 
      label: 'Accepted', 
      icon: <ThumbsUp className="w-5 h-5" />,
      description: 'Mandate approved by client',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'sip-setup', 
      label: 'SIP Done', 
      icon: <Check className="w-5 h-5" />,
      description: 'Systematic Investment Plan activated'
    }
  ];

  const currentIndex = stages.findIndex(stage => stage.id === status);
  const isComplete = status === 'sip-setup';

  const handlePrevious = () => {
    if (currentIndex > 0 && onStatusChange) {
      const newStatus = stages[currentIndex - 1].id;
      onStatusChange(newStatus);
    }
  };

  const handleNext = () => {
    if (currentIndex < stages.length - 1 && onStatusChange) {
      const newStatus = stages[currentIndex + 1].id;
      onStatusChange(newStatus);
    }
  };

  if (isLost) {
    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold text-lg ${
              neon 
                ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.7)]' 
                : 'text-red-500'
            }`}>
              Lead Lost
            </div>
            <div className={`text-sm mt-1 ${
              neon ? 'text-red-300/60' : 'text-gray-500'
            }`}>
              This lead has been marked as lost
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full py-1">
      {/* Previous / Description / Next Controls */}
      <div className="flex justify-between items-center mb-5">
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
            currentIndex === 0 
              ? neon 
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : neon 
                ? 'bg-slate-900 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,255,255,0.15)] hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(0,255,255,0.35)] hover:text-cyan-200 active:bg-cyan-500/20 active:shadow-[0_0_20px_rgba(0,255,255,0.5)]' 
                : `${buttonBg} text-white hover:opacity-90`
          }`}
        >
          ← Previous
        </button>

        <div className="text-center px-10">
          <p className={`text-sm ${
            neon 
              ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(0,255,255,0.1)]' 
              : mutedText
          }`}>
            {stages[currentIndex]?.description}
          </p>
          {stages[currentIndex]?.actionLink && (
            <a 
              href={stages[currentIndex].actionLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`mt-4 inline-flex items-center text-sm underline transition-all duration-300 ${
                neon 
                  ? 'text-cyan-400 hover:text-cyan-200 drop-shadow-[0_0_6px_rgba(0,255,255,0.4)] hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]' 
                  : `${textColor} hover:opacity-80`
              }`}
            >
              {stages[currentIndex].label} Portal
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        
        <button 
          onClick={handleNext}
          disabled={currentIndex === stages.length - 1}
          className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
            currentIndex === stages.length - 1 
              ? neon 
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : neon 
                ? 'bg-slate-900 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,255,255,0.15)] hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(0,255,255,0.35)] hover:text-cyan-200 active:bg-cyan-500/20 active:shadow-[0_0_20px_rgba(0,255,255,0.5)]' 
                : `${buttonBg} text-white hover:opacity-90`
          }`}
        >
          Next →
        </button>
      </div>
      
      {/* Stage Circles & Connectors */}
      <div className="relative flex justify-between items-center">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center z-10">
                <motion.div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent 
                      ? isComplete 
                        ? neon 
                          ? 'border-emerald-400 bg-slate-900 shadow-[0_0_18px_rgba(52,211,153,0.5)]' 
                          : `border-green-500 ${highlightBg} shadow-lg` 
                        : neon 
                          ? 'border-cyan-400 bg-slate-900 shadow-[0_0_18px_rgba(0,255,255,0.5)]' 
                          : `${borderColor} ${cardBg} shadow-lg` 
                      : isCompleted 
                        ? isComplete 
                          ? neon 
                            ? 'border-emerald-500/60 bg-slate-900 shadow-[0_0_6px_rgba(52,211,153,0.2)]' 
                            : `border-green-300 ${highlightBg}` 
                          : neon 
                            ? 'border-cyan-500/60 bg-slate-900 shadow-[0_0_6px_rgba(0,255,255,0.2)]' 
                            : `${borderColor} ${cardBg}` 
                        : neon 
                          ? 'border-slate-600 bg-slate-900' 
                          : `border-gray-200 ${cardBg}`
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {/* Spinning circle for current step */}
                  {isCurrent && (
                    <motion.div
                      className={`absolute inset-0 rounded-full border-2 border-transparent ${
                        neon ? 'border-t-cyan-400 border-r-cyan-400' : `border-t-[var(--theme-accent)] border-r-[var(--theme-accent)]`
                      }`}
                      style={!neon ? { borderColor: `${buttonBg} transparent transparent ${buttonBg}` } : undefined}
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                  
                  {isCompleted ? (
                    <Check className={`w-6 h-6 ${
                      isComplete 
                        ? neon ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'text-green-500' 
                        : neon ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]' : `${buttonBg}`.replace('bg-', 'text-').replace(/\[/, '').replace(/\]/, '')
                    }`} style={!neon ? { color: buttonBg?.replace('bg-', '') } : undefined} />
                  ) : isCurrent ? (
                    <motion.div 
                      animate={{ 
                        scale: [1, 1, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <div style={!neon ? { color: buttonBg?.replace('bg-', '') } : undefined} className={
                        isComplete 
                          ? neon ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'text-green-500' 
                          : neon ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]' : ''
                      }>
                        {stage.icon}
                      </div>
                    </motion.div>
                  ) : (
                    <span className={`text-xs font-medium ${
                      neon ? 'text-slate-500' : mutedText
                    }`}>
                      {stage.icon}
                    </span>
                  )}
                </motion.div>
                
                {/* Stage Label */}
                <span className={`text-xs font-medium text-center max-w-[80px] mt-2 transition-all duration-300 ${
                  isCurrent 
                    ? isComplete 
                      ? neon ? 'text-emerald-400 font-semibold drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]' : 'text-green-600 font-semibold' 
                      : neon ? 'text-cyan-400 font-semibold drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]' : `${textColor} font-semibold` 
                    : isCompleted 
                      ? isComplete 
                        ? neon ? 'text-emerald-400/80' : 'text-green-500' 
                        : neon ? 'text-cyan-400/80' : `${textColor} opacity-70` 
                      : neon ? 'text-slate-500' : mutedText
                }`}>
                  {stage.label}
                </span>
              </div>

              {/* Connectors */}
              {index < stages.length - 1 && (
                <div className="flex-1 flex items-center justify-center px-1">
                  {neon ? (
                    <div className="relative w-full h-1 flex items-center justify-center">
                      <div className={`absolute inset-0 rounded-full ${
                        isCompleted
                          ? isComplete 
                            ? 'bg-emerald-500/30 shadow-[0_0_6px_rgba(52,211,153,0.3)]' 
                            : 'bg-cyan-500/30 shadow-[0_0_6px_rgba(0,255,255,0.3)]'
                          : 'bg-slate-700/50'
                      }`} />
                      {isCompleted && (
                        <motion.div 
                          className={`absolute inset-0 rounded-full ${
                            isComplete 
                              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6),0_0_20px_rgba(52,211,153,0.3)]' 
                              : 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.6),0_0_20px_rgba(0,255,255,0.3)]'
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          style={{ transformOrigin: 'left' }}
                        />
                      )}
                      <ArrowRight className={`relative z-10 w-4 h-4 ${
                        isCompleted 
                          ? isComplete 
                            ? 'text-emerald-300 drop-shadow-[0_0_4px_rgba(52,211,153,0.8)]' 
                            : 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.8)]' 
                          : 'text-slate-600'
                      }`} />
                    </div>
                  ) : (
                    <ArrowRight className={`w-6 h-6 transition-all duration-300 ${
                      isCompleted ? '' : 'text-gray-300'
                    }`} style={isCompleted ? { color: buttonBg } : undefined} />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}