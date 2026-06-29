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
import LeadProgressBar from './LeadProgressBar'; 

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
  const neon = theme === 'neon-cyberpunk';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={`${cardBg} ${borderColor} ${neon ? 'shadow-[0_0_25px_rgba(0,255,255,0.08)] border-cyan-500/20' : ''}`}>
        <CardHeader>
          <CardTitle className={neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}>
            Add New Lead
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className={`block mb-1 text-sm font-medium ${neon ? 'text-slate-300 drop-shadow-[0_0_2px_rgba(0,255,255,0.15)]' : ''}`}>Name *</label>
              <Input
                type="text"
                value={newLead.name}
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                className={`${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,255,255,0.25)] text-cyan-100 placeholder-slate-500 transition-all duration-300' : ''}`}
                placeholder={neon ? 'Enter lead name...' : ''}
                required
              />
            </div>
            
            <div>
              <label className={`block mb-1 text-sm font-medium ${neon ? 'text-slate-300 drop-shadow-[0_0_2px_rgba(0,255,255,0.15)]' : ''}`}>Email *</label>
              <Input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                className={`${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,255,255,0.25)] text-cyan-100 placeholder-slate-500 transition-all duration-300' : ''}`}
                placeholder={neon ? 'Enter email address...' : ''}
                required
              />
            </div>
            
            <div>
              <label className={`block mb-1 text-sm font-medium ${neon ? 'text-slate-300 drop-shadow-[0_0_2px_rgba(0,255,255,0.15)]' : ''}`}>Phone *</label>
              <Input
                type="tel"
                value={newLead.phone}
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                className={`${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,255,255,0.25)] text-cyan-100 placeholder-slate-500 transition-all duration-300' : ''}`}
                placeholder={neon ? 'Enter phone number...' : ''}
                required
              />
            </div>
            
            <div>
              <label className={`block mb-1 text-sm font-medium ${neon ? 'text-slate-300 drop-shadow-[0_0_2px_rgba(0,255,255,0.15)]' : ''}`}>Interested Products *</label>
              <div className={`p-3 border rounded-md ${inputBg} ${borderColor} ${neon ? 'border-cyan-500/20 shadow-[0_0_4px_rgba(0,255,255,0.05)]' : ''}`}>
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
                  <div key={product} className="flex items-center mb-2 last:mb-0">
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
                      className={`mr-2 h-4 w-4 rounded ${neon ? 'accent-cyan-400' : ''}`}
                    />
                    <label 
                      htmlFor={`product-${product}`} 
                      className={`text-sm ${neon ? 'text-slate-300' : ''}`}
                    >
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
            className={`rounded-full ${getButtonClasses(theme)} w-full ${neon ? 'shadow-[0_0_15px_rgba(0,255,255,0.35)] hover:shadow-[0_0_25px_rgba(0,255,255,0.55)] transition-all duration-300' : ''}`}
            disabled={!newLead.name || !newLead.email || !newLead.phone || newLead.productInterest.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
        </CardFooter>
      </Card>

      <div className="md:col-span-2 space-y-4">
        <Card className={`${cardBg} ${borderColor} ${neon ? 'shadow-[0_0_25px_rgba(0,255,255,0.08)] border-cyan-500/20' : ''}`}>
          <CardHeader>
            <CardTitle className={neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : ''}>
              Lead List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads
              .sort((a, b) => {
                if (a.status === 'lost' && b.status !== 'lost') return 1;
                if (a.status !== 'lost' && b.status === 'lost') return -1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map(lead => (
                <div 
                  key={lead.id} 
                  className={`p-4 border rounded-lg transition-all duration-300 ${
                    borderColor
                  } ${
                    expandedLeadId === lead.id 
                      ? selectedBg 
                      : highlightBg
                  } ${
                    neon 
                      ? expandedLeadId === lead.id 
                        ? 'border-cyan-500/40 shadow-[0_0_18px_rgba(0,255,255,0.12)] bg-cyan-500/5' 
                        : 'border-slate-700 hover:border-cyan-500/25 hover:shadow-[0_0_8px_rgba(0,255,255,0.06)]' 
                      : ''
                  }`}
                >
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleLead(lead.id)}
                  >
                    <div>
                      <h3 className={`font-bold text-lg ${
                        lead.status === 'lost' 
                          ? neon ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-red-600' 
                          : neon ? 'text-cyan-100 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' : ''
                      }`}>
                        {lead.name}
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lead.productInterest.map(product => (
                          <span 
                            key={product} 
                            className={`text-xs px-2.5 py-1 rounded-full transition-all duration-300 ${
                              neon 
                                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shadow-[0_0_4px_rgba(0,255,255,0.08)] hover:bg-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_8px_rgba(0,255,255,0.15)]' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                      <p className={`text-sm mt-1 ${neon ? 'text-slate-400' : mutedText}`}>{lead.email} | {lead.phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        lead.status === 'new' 
                          ? neon 
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_6px_rgba(0,255,255,0.15)]' 
                            : 'bg-blue-100 text-blue-800'
                          : lead.status === 'contacted' 
                            ? neon 
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_6px_rgba(245,158,11,0.15)]' 
                              : 'bg-yellow-100 text-yellow-800'
                            : lead.status === 'qualified' 
                              ? neon 
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_6px_rgba(52,211,153,0.15)]' 
                                : 'bg-green-100 text-green-800'
                              : neon 
                                ? 'bg-red-500/15 text-red-300 border border-red-500/30 shadow-[0_0_6px_rgba(248,113,113,0.15)]' 
                                : 'bg-red-100 text-red-800'
                      }`}>
                        {lead.status}
                      </span>
                      {expandedLeadId === lead.id ? (
                        <ChevronUp className={`h-4 w-4 ${neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''}`} />
                      ) : (
                        <ChevronDown className={`h-4 w-4 ${neon ? 'text-slate-500' : ''}`} />
                      )}
                    </div>
                  </div>

                  {(expandedLeadId === lead.id || (lead.productInterest.some(product => product.includes('Mutual Funds')) && lead.status !== 'lost')) && (
                    <div className="my-3">
                      <LeadProgressBar 
                        status={lead.progressStatus} 
                        onStatusChange={(newStatus) => updateLeadProgress(lead.id, newStatus)}
                        isLost={lead.status === 'lost'}
                        themeName={theme}
                      />
                    </div>
                  )}

                  {expandedLeadId === lead.id && (
                    <div className={`mt-4 pt-4 border-t ${neon ? 'border-cyan-500/20' : 'border-gray-200'}`}>
                      <div className="flex flex-wrap justify-between gap-3 mb-4">
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant={lead.status === 'contacted' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, 'contacted')}
                            className={`transition-all duration-300 ${
                              lead.status === 'contacted' 
                                ? neon 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:shadow-[0_0_16px_rgba(245,158,11,0.5)] hover:bg-amber-500/30' 
                                  : getButtonClasses(theme, 'primary') 
                                : neon 
                                  ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(0,255,255,0.2)]' 
                                  : getButtonClasses(theme, 'outline')
                            }`}
                          >
                            Contacted
                          </Button>
                          <Button 
                            variant={lead.status === 'qualified' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, 'qualified')}
                            className={`transition-all duration-300 ${
                              lead.status === 'qualified' 
                                ? neon 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:shadow-[0_0_16px_rgba(52,211,153,0.5)] hover:bg-emerald-500/30' 
                                  : 'bg-green-500 hover:bg-green-600' 
                                : neon 
                                  ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(0,255,255,0.2)]' 
                                  : ''
                            }`}
                          >
                            Qualified
                          </Button>
                          <Button 
                            variant={lead.status === 'lost' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, 'lost')}
                            className={`transition-all duration-300 ${
                              lead.status === 'lost' 
                                ? neon 
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.3)] hover:shadow-[0_0_16px_rgba(248,113,113,0.5)] hover:bg-red-500/30' 
                                  : 'bg-red-500 hover:bg-red-600' 
                                : neon 
                                  ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(0,255,255,0.2)]' 
                                  : ''
                            }`}
                          >
                            Lost
                          </Button>
                        </div>
                        
                        <Button 
                          onClick={() => convertLeadToClient(lead.id)}
                          disabled={lead.status === 'lost'}
                          className={`rounded-full transition-all duration-300 ${
                            lead.status === 'lost' 
                              ? neon 
                                ? 'opacity-40 cursor-not-allowed bg-slate-800/50 text-slate-600 border border-slate-700/30' 
                                : '' 
                              : getButtonClasses(theme) + (neon ? ' shadow-[0_0_15px_rgba(0,255,255,0.35)] hover:shadow-[0_0_25px_rgba(0,255,255,0.55)]' : '')
                          }`}
                        >
                          Convert to Client
                        </Button>
                      </div>

                      <div>
                        <h4 className={`font-bold mb-2 ${neon ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' : ''}`}>Notes</h4>
                        <div className="space-y-2 mb-4">
                          {lead.notes.map((note, index) => (
                            <div key={index} className={`p-2.5 rounded-md ${
                              neon 
                                ? 'bg-slate-800/80 text-slate-300 border border-cyan-500/10 shadow-[0_0_4px_rgba(0,255,255,0.04)]' 
                                : highlightBg
                            }`}>
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
                            className={`flex-1 ${inputBg} ${borderColor} ${neon ? 'focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,255,255,0.25)] text-cyan-100 placeholder-slate-500 transition-all duration-300' : ''}`}
                          />
                          <Button 
                            onClick={() => {
                              addNoteToLead(lead.id);
                              if (expandedLeadId !== lead.id) {
                                toggleLead(lead.id);
                              }
                            }}
                            className={`ml-2 transition-all duration-300 ${
                              neon 
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:bg-cyan-500/30 hover:shadow-[0_0_18px_rgba(0,255,255,0.4)] hover:border-cyan-400 active:bg-cyan-500/20' 
                                : ''
                            }`}
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