'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { ThemeName, themes, getButtonClasses, isNeon } from '@/lib/theme';
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

export default function LeadsTab({
  theme, leads, addLead, newLead, setNewLead, toggleLead, expandedLeadId,
  updateLeadStatus, updateLeadProgress, convertLeadToClient, addNoteToLead, newNote, setNewNote
}: LeadsTabProps) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, highlightBg, selectedBg, mutedText, inputBg } = currentTheme;
  const neon = isNeon(theme);

  // ─── Consolidated Neon Styles ──────────────────────────────
  const ns = neon ? {
    card: 'shadow-[0_0_25px_rgba(0,255,255,0.08)] border-cyan-500/20',
    title: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]',
    input: `${inputBg} ${borderColor} rounded-full focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-shadow`,
    checkbox: 'border-cyan-500/40 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-400',
    checkboxLabel: 'text-slate-300 hover:text-cyan-200 transition-colors',
    checkboxBox: `${inputBg} ${borderColor} border-cyan-500/20 shadow-[0_0_4px_rgba(0,255,255,0.05)]`,
    btnPrimary: 'shadow-[0_0_15px_rgba(0,255,255,0.35)] hover:shadow-[0_0_25px_rgba(0,255,255,0.55)] transition-all duration-300',
    btnOutline: 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(0,255,255,0.2)]',
    btnContacted: 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:shadow-[0_0_16px_rgba(245,158,11,0.5)] hover:bg-amber-500/30',
    btnQualified: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:shadow-[0_0_16px_rgba(52,211,153,0.5)] hover:bg-emerald-500/30',
    btnLost: 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.3)] hover:shadow-[0_0_16px_rgba(248,113,113,0.5)] hover:bg-red-500/30',
    btnAddNote: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:bg-cyan-500/30 hover:shadow-[0_0_18px_rgba(0,255,255,0.4)] hover:border-cyan-400 active:bg-cyan-500/20',
    btnDisabled: 'opacity-40 cursor-not-allowed !bg-slate-800/50 text-slate-600 border border-slate-700/30',
    leadExpanded: 'border-cyan-500/40 shadow-[0_0_18px_rgba(0,255,255,0.12)] !bg-cyan-500/5',
    leadCollapsed: 'border-slate-700 hover:border-cyan-500/25 hover:shadow-[0_0_8px_rgba(0,255,255,0.06)]',
    leadName: 'text-cyan-100 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]',
    leadNameLost: 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]',
    productTag: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shadow-[0_0_4px_rgba(0,255,255,0.08)]',
    statusNew: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_6px_rgba(0,255,255,0.15)]',
    statusContacted: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_6px_rgba(245,158,11,0.15)]',
    statusQualified: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_6px_rgba(52,211,153,0.15)]',
    statusLost: 'bg-red-500/15 text-red-300 border border-red-500/30 shadow-[0_0_6px_rgba(248,113,113,0.15)]',
    divider: 'border-cyan-500/20',
    noteBox: 'bg-slate-800/80 text-slate-300 border border-cyan-500/10 shadow-[0_0_4px_rgba(0,255,255,0.04)]',
    chevronActive: 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]',
    chevronInactive: 'text-slate-500',
    contactInfo: 'text-slate-400',
    notesTitle: 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]',
  } : {};

  const products = [
    'Mutual Funds - SIP', 'Mutual Funds - Lumpsum', 'Mutual Funds - SWP', 'Mutual Funds - STP',
    'Health Insurance', 'Life Insurance', 'Taxation Planning', 'National Pension System (NPS)'
  ];

  const getStatusStyle = (status: Lead['status']) => {
    if (!neon) {
      return { new: 'bg-blue-100 text-blue-800', contacted: 'bg-yellow-100 text-yellow-800', qualified: 'bg-green-100 text-green-800', lost: 'bg-red-100 text-red-800' }[status];
    }
    return { new: ns.statusNew, contacted: ns.statusContacted, qualified: ns.statusQualified, lost: ns.statusLost }[status];
  };

  const getActiveStatusBtn = (status: Lead['status']) => {
    if (!neon) return '';
    return { contacted: ns.btnContacted, qualified: ns.btnQualified, lost: ns.btnLost }[status] || '';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Add New Lead Card */}
      <Card className={`${cardBg} ${borderColor} ${neon ? ns.card : ''}`}>
        <CardHeader>
          <CardTitle className={neon ? ns.title : ''}>Add New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Name Input - Rounded Full */}
            <div className="space-y-2">
              <Label htmlFor="lead-name">Name *</Label>
              <Input
                id="lead-name"
                type="text"
                value={newLead.name}
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                placeholder="Enter lead name"
                className={neon ? ns.input : `${inputBg} ${borderColor} rounded-full`}
                required
              />
            </div>
            
            {/* Email Input - Rounded Full */}
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email *</Label>
              <Input
                id="lead-email"
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                placeholder="Enter email address"
                className={neon ? ns.input : `${inputBg} ${borderColor} rounded-full`}
                required
              />
            </div>
            
            {/* Phone Input - Rounded Full */}
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone *</Label>
              <Input
                id="lead-phone"
                type="tel"
                value={newLead.phone}
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                placeholder="Enter phone number"
                className={neon ? ns.input : `${inputBg} ${borderColor} rounded-full`}
                required
              />
            </div>
            
            {/* Product Interest Checkboxes */}
            <div className="space-y-2">
              <Label>Interested Products *</Label>
              <div className={`p-3 border rounded-md ${neon ? ns.checkboxBox : `${inputBg} ${borderColor}`}`}>
                {products.map(product => {
                  const isChecked = newLead.productInterest.includes(product);
                  return (
                    <div key={product} className="flex items-center mb-2 last:mb-0">
                      <Checkbox
                        id={`product-${product}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewLead({...newLead, productInterest: [...newLead.productInterest, product]});
                          } else {
                            setNewLead({...newLead, productInterest: newLead.productInterest.filter(p => p !== product)});
                          }
                        }}
                        className={neon ? ns.checkbox : ''}
                      />
                      <Label htmlFor={`product-${product}`} className={`ml-2 text-sm cursor-pointer ${neon ? ns.checkboxLabel : ''}`}>
                        {product}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={addLead} 
            className={`rounded-full ${getButtonClasses(theme)} w-full ${neon ? ns.btnPrimary : ''}`}
            disabled={!newLead.name || !newLead.email || !newLead.phone || newLead.productInterest.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
        </CardFooter>
      </Card>

      {/* Lead List */}
      <div className="md:col-span-2 space-y-4">
        <Card className={`${cardBg} ${borderColor} ${neon ? ns.card : ''}`}>
          <CardHeader>
            <CardTitle className={neon ? ns.title : ''}>Lead List</CardTitle>
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
                    className={`p-4 border rounded-lg transition-all duration-300 ${borderColor} ${
                      expandedLeadId === lead.id ? selectedBg : highlightBg
                    } ${neon ? (expandedLeadId === lead.id ? ns.leadExpanded : ns.leadCollapsed) : ''}`}
                  >
                    {/* Lead Header */}
                    <div 
                      className="flex justify-between items-start cursor-pointer"
                      onClick={() => toggleLead(lead.id)}
                    >
                      <div>
                        <h3 className={`font-bold text-lg ${
                          lead.status === 'lost' 
                            ? (neon ? ns.leadNameLost : 'text-red-600') 
                            : (neon ? ns.leadName : '')
                        }`}>
                          {lead.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lead.productInterest.map(product => (
                            <span 
                              key={product} 
                              className={`text-xs px-2.5 py-1 rounded-full transition-all duration-300 ${
                                neon ? ns.productTag : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                        <p className={`text-sm mt-1 ${neon ? ns.contactInfo : mutedText}`}>
                          {lead.email} | {lead.phone}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusStyle(lead.status)}`}>
                          {lead.status}
                        </span>
                        {expandedLeadId === lead.id ? (
                          <ChevronUp className={`h-4 w-4 ${neon ? ns.chevronActive : ''}`} />
                        ) : (
                          <ChevronDown className={`h-4 w-4 ${neon ? ns.chevronInactive : ''}`} />
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
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

                    {/* Expanded Lead Details */}
                    {expandedLeadId === lead.id && (
                      <div className={`mt-4 pt-4 border-t ${neon ? ns.divider : 'border-gray-200'}`}>
                        <div className="flex flex-wrap justify-between gap-3 mb-4">
                          <div className="flex flex-wrap gap-2">
                            {['contacted', 'qualified', 'lost'].map((status) => (
                              <Button 
                                key={status}
                                variant={lead.status === status ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateLeadStatus(lead.id, status as Lead['status'])}
                                className={`transition-all duration-300 ${
                                  lead.status === status 
                                    ? (neon ? getActiveStatusBtn(status as Lead['status']) : getButtonClasses(theme, 'primary'))
                                    : (neon ? ns.btnOutline : getButtonClasses(theme, 'outline'))
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Button>
                            ))}
                          </div>
                          
                          <Button 
                            onClick={() => convertLeadToClient(lead.id)}
                            disabled={lead.status === 'lost'}
                            className={`rounded-full transition-all duration-300 ${
                              lead.status === 'lost' 
                                ? (neon ? ns.btnDisabled : '') 
                                : getButtonClasses(theme) + (neon ? ` ${ns.btnPrimary}` : '')
                            }`}
                          >
                            Convert to Client
                          </Button>
                        </div>

                        {/* Notes Section */}
                        <div>
                          <h4 className={`font-bold mb-2 ${neon ? ns.notesTitle : ''}`}>Notes</h4>
                          <div className="space-y-2 mb-4">
                            {lead.notes.map((note, index) => (
                              <div key={index} className={`p-2.5 rounded-md ${neon ? ns.noteBox : highlightBg}`}>
                                {note}
                              </div>
                            ))}
                          </div>
                          <div className="flex">
                            {/* Add Note Input - Rounded Full */}
                            <Input
                              type="text"
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Add a note..."
                              className={neon ? ns.input : `${inputBg} ${borderColor} rounded-full`}
                            />
                            <Button 
                              onClick={() => {
                                addNoteToLead(lead.id);
                                if (expandedLeadId !== lead.id) {
                                  toggleLead(lead.id);
                                }
                              }}
                              className={`ml-2 transition-all duration-300 ${neon ? ns.btnAddNote : ''}`}
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