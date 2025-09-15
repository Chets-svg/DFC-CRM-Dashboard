"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Button 
} from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus,
  ArrowRight,
  Check,
  CreditCard,
  FileSignature,
  FileText,
  Shield,
  ThumbsUp,
  User
} from "lucide-react";
import { motion } from 'framer-motion';
import { ThemeName, themes, getButtonClasses } from '@/lib/theme';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  productInterest: string[];
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  notes: string[];
  progressStatus: string;
  createdAt: string;
}

interface NewLead {
  name: string;
  email: string;
  phone: string;
  productInterest: string[];
}

interface LeadsTabProps {
  theme: ThemeName;
  leads: Lead[];
  addLead: () => void;
  newLead: NewLead;
  setNewLead: (lead: NewLead) => void;
  toggleLead: (id: string) => void;
  expandedLeadId: string | null;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  updateLeadProgress: (id: string, status: string) => void;
  convertLeadToClient: (id: string) => void;
  addNoteToLead: (id: string) => void;
  newNote: string;
  setNewNote: (note: string) => void;
}

interface Stage {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  actionLink?: string;
}

export default function LeadsTab({
  theme,
  leads,
  addLead,
  newLead,
  setNewLead,
  toggleLead,
  expandedLeadId,
  updateLeadStatus,
  updateLeadProgress,
  convertLeadToClient,
  addNoteToLead,
  newNote,
  setNewNote
}: LeadsTabProps) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, highlightBg, selectedBg, mutedText, inputBg } = currentTheme;

  const LeadProgressBar = ({ 
    status = 'lead-generated', 
    onStatusChange,
    isLost = false
  }: {
    status?: string;
    onStatusChange?: (newStatus: string) => void;
    isLost?: boolean;
  }) => {
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
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <CardTitle>Add New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block mb-1">Name *</label>
              <Input
                type="text"
                value={newLead.name}
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                className={`${inputBg} ${borderColor}`}
                required
              />
            </div>
            
            {/* Email Input */}
            <div>
              <label className="block mb-1">Email *</label>
              <Input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                className={`${inputBg} ${borderColor}`}
                required
              />
            </div>
            
            {/* Phone Input */}
            <div>
              <label className="block mb-1">Phone *</label>
              <Input
                type="tel"
                value={newLead.phone}
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                className={`${inputBg} ${borderColor}`}
                required
              />
            </div>
            
            {/* Product Interest - Multi-select */}
            <div>
              <label className="block mb-1">Interested Products *</label>
              <div className={`p-3 border rounded ${inputBg} ${borderColor}`}>
                {[
                  'Mutual Funds - SIP',
                  'Mutual Funds - Lumpsum',
                  'Mutual Funds - SWP',
                  'Mutual Funds - STP',
                  'Health Insurance',
                  'Life Insurance',
                  'Taxation Planning',
                  'National Pension System (NPS)'
                ].map(product => (
                  <div key={product} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`product-${product}`}
                      checked={newLead.productInterest.includes(product)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewLead({
                            ...newLead,
                            productInterest: [...newLead.productInterest, product]
                          });
                        } else {
                          setNewLead({
                            ...newLead,
                            productInterest: newLead.productInterest.filter(p => p !== product)
                          });
                        }
                      }}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor={`product-${product}`} className="text-sm">
                      {product}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={addLead} 
            className={`${getButtonClasses(theme)} w-full`}
            disabled={!newLead.name || !newLead.email || !newLead.phone || newLead.productInterest.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
        </CardFooter>
      </Card>

      <div className="md:col-span-2 space-y-4">
        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader>
            <CardTitle>Lead List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads
              .sort((a, b) => {
                // Push lost leads to the bottom
                if (a.status === 'lost' && b.status !== 'lost') return 1;
                if (a.status !== 'lost' && b.status === 'lost') return -1;
                // For non-lost leads, sort by creation date (newest first)
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map(lead => (
                <div key={lead.id} className={`p-4 border rounded-lg ${borderColor} ${expandedLeadId === lead.id ? selectedBg : highlightBg}`}>
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleLead(lead.id)}
                  >
                    <div>
                      {/* Make lost lead names red */}
                      <h3 className={`font-bold ${lead.status === 'lost' ? 'text-red-600' : ''}`}>
                        {lead.name}
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lead.productInterest.map(product => (
                          <span 
                            key={product} 
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                      <p className={`text-sm ${mutedText}`}>{lead.email} | {lead.phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lead.status}
                      </span>
                      {expandedLeadId === lead.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar - Always shown for lost leads when expanded, otherwise only for mutual fund leads */}
                  {(expandedLeadId === lead.id || (lead.productInterest.some(product => product.includes('Mutual Funds')) && lead.status !== 'lost')) && (
                    <div className="my-3">
                      <LeadProgressBar 
                        status={lead.progressStatus} 
                        onStatusChange={(newStatus) => updateLeadProgress(lead.id, newStatus)}
                        isLost={lead.status === 'lost'}
                      />
                    </div>
                  )}

                  {/* Expanded Lead Details */}
                  {expandedLeadId === lead.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between mb-4">
                        <div className="space-x-2">
                          <Button 
                            variant={lead.status === 'contacted' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, 'contacted')}
                            className={`${lead.status === 'contacted' ? getButtonClasses(theme, 'primary') : getButtonClasses(theme, 'outline')}`}
                          >
                            Contacted
                          </Button>
                          <Button 
                            variant={lead.status === 'qualified' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, 'qualified')}
                            className={lead.status === 'qualified' ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            Qualified
                          </Button>
                          <Button 
                            variant={lead.status === 'lost' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, 'lost')}
                            className={lead.status === 'lost' ? 'bg-red-500 hover:bg-red-600' : ''}
                          >
                            Lost
                          </Button>
                        </div>
                        
                        <Button 
                          onClick={() => convertLeadToClient(lead.id)}
                          disabled={lead.status === 'lost'}
                          className={`${getButtonClasses(theme)}`}
                        >
                          Convert to Client
                        </Button>
                      </div>

                      <div>
                        <h4 className="font-bold mb-2">Notes</h4>
                        <div className="space-y-2 mb-4">
                          {lead.notes.map((note, index) => (
                            <div key={index} className={`p-2 rounded ${highlightBg}`}>
                              {note}
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <Input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a note..."
                            className={`flex-1 ${inputBg} ${borderColor}`}
                          />
                          <Button 
                            onClick={() => {
                              addNoteToLead(lead.id);
                              if (expandedLeadId !== lead.id) {
                                setExpandedLeadId(lead.id);
                              }
                            }}
                            className="ml-2"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}