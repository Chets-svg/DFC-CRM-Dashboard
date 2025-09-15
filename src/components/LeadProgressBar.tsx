"use client";

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
  theme?: 'light' | 'dark';
  isLost?: boolean;
}

export default function LeadProgressBar({ 
  status = 'lead-generated', 
  onStatusChange,
  theme = 'light',
  isLost = false
}: LeadProgressBarProps) {
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
      description: 'Lead has been created in the system',
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

  // If lead is lost, show a simplified progress bar
  if (isLost) {
    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 font-bold text-lg">Lead Lost</div>
            <div className="text-sm text-gray-500 mt-1">This lead has been marked as lost</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full py-1">
      <div className="flex justify-between items-center mb-5">
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded ${
            currentIndex === 0 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Previous
        </button>

        <div className="text-center px-10">
          <p className="text-sm text-muted-foreground">
            {stages[currentIndex]?.description}
          </p>
          {stages[currentIndex]?.actionLink && (
            <a 
              href={stages[currentIndex].actionLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
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
          className={`px-4 py-2 rounded ${
            currentIndex === stages.length - 1 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Next
        </button>
      </div>
      
      <div className="relative flex justify-between items-center">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center z-10">
                <motion.div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isCurrent 
                      ? isComplete 
                        ? 'border-green-500 bg-green-50 shadow-lg' 
                        : 'border-blue-500 bg-white shadow-lg' 
                      : isCompleted 
                        ? isComplete 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-blue-300 bg-white' 
                        : 'border-gray-200 bg-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {/* Spinning circle for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500"
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                  
                  {isCompleted ? (
                    <Check className={`w-6 h-6 ${isComplete ? 'text-green-500' : 'text-blue-500'}`} />
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
                      <div className={isComplete ? 'text-green-500' : 'text-blue-500'}>
                        {stage.icon}
                      </div>
                    </motion.div>
                  ) : (
                    <span className="text-xs font-medium text-gray-500">
                      {stage.icon}
                    </span>
                  )}
                </motion.div>
                <span className={`text-xs font-medium text-center max-w-[80px] mt-2 ${
                  isCurrent 
                    ? isComplete 
                      ? 'text-green-600 font-semibold' 
                      : 'text-blue-600 font-semibold' 
                    : isCompleted 
                      ? isComplete 
                        ? 'text-green-500' 
                        : 'text-blue-500' 
                      : 'text-gray-500'
                }`}>
                  {stage.label}
                </span>
              </div>

              {index < stages.length - 1 && (
                <div className="flex-1 flex justify-center">
                  <ArrowRight className={`w-6 h-6 ${
                    isCompleted 
                      ? isComplete 
                        ? 'text-green-500' 
                        : 'text-blue-500' 
                      : 'text-gray-300'
                  }`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}