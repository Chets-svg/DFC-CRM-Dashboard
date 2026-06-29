"use client";

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  updateDocument,
  LEADS_COLLECTION,
  KYCS_COLLECTION
} from "@/lib/firebase-config";
import { 
  Check, 
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  MapPin,
  Eye,
  Send
} from "lucide-react";
import { ThemeName, themes, getButtonClasses, isNeon } from '@/lib/theme';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  progressStatus: string;
  status: string;
}

interface KYC {
  id: string;
  leadId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  completedDate?: string;
}

interface KYCTabProps {
  theme: ThemeName;
  leads: Lead[];
  kycs: KYC[];
  showAlert: (message: string) => void;
}

export default function KYCTab({
  theme,
  leads,
  kycs,
  showAlert
}: KYCTabProps) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, highlightBg, mutedText } = currentTheme;
  const neon = isNeon(theme);

  const pendingKYC = leads.filter(lead => 
    lead.progressStatus === 'kyc-started'
  ).length;

  // ── Neon helper classes ──
  const neonCardCls = neon
    ? 'bg-gray-950 border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.06)]'
    : `${cardBg} ${borderColor}`;

  const neonTitleCls = neon
    ? 'text-cyan-300 tracking-wide'
    : '';

  const neonDescriptionCls = neon
    ? 'text-cyan-500/60'
    : mutedText;

  const neonLeadCardCls = neon
    ? 'p-4 border rounded-xl bg-cyan-950/20 border-cyan-500/15 hover:border-cyan-400/30 transition-colors'
    : `p-4 border rounded ${highlightBg} ${borderColor}`;

  const neonInfoBoxCls = neon
    ? 'p-4 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/15'
    : `p-4 rounded ${highlightBg}`;

  const neonLegendBoxCls = neon
    ? 'p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/15'
    : `p-4 rounded ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'}`;

  const neonStepTextCls = neon
    ? 'text-cyan-200/80'
    : '';

  const neonBodyTextCls = neon
    ? 'text-cyan-200/70'
    : '';

  const neonHeadingCls = neon
    ? 'text-cyan-300 font-semibold'
    : 'font-bold';

  // KYC status badge classes
  const statusBadgeCls = (status: string) => {
    if (neon) {
      switch (status) {
        case 'pending':
          return 'bg-gray-800/50 text-gray-400 border border-gray-500/30';
        case 'in-progress':
          return 'bg-amber-950/40 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
        case 'completed':
          return 'bg-green-950/40 text-green-300 border border-green-500/30 shadow-[0_0_8px_rgba(74,222,128,0.15)]';
        case 'failed':
          return 'bg-red-950/40 text-red-300 border border-red-500/30 shadow-[0_0_8px_rgba(255,0,0,0.15)]';
        default:
          return 'bg-gray-800/50 text-gray-400 border border-gray-500/30';
      }
    }
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Legend dot classes
  const legendDotCls = (color: string, neonColor: string) => {
    if (neon) {
      return `w-3 h-3 rounded-full mr-2 bg-${neonColor}-500 shadow-[0_0_6px_rgba(0,0,0,0.3)]`;
    }
    return `w-3 h-3 bg-${color}-300 rounded-full mr-2`;
  };

  // Complete button classes
  const completeBtnCls = neon
    ? 'border-green-500/30 text-green-400 bg-green-950/30 hover:bg-green-500/10 hover:border-green-400 hover:shadow-[0_0_12px_rgba(74,222,128,0.2)] rounded-lg'
    : getButtonClasses(theme, 'outline');

  // Step icon classes
  const stepIconCls = (color: string) => neon
    ? `text-${color}-400`
    : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ── KYC Status Card ── */}
      <Card className={`${cardBg} ${borderColor} h-full`}>
        <CardHeader>
          <CardTitle className={neonTitleCls}>
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${neon ? 'text-cyan-400' : ''}`} />
              KYC Status
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                neon
                  ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {pendingKYC}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads
              .filter(lead => lead.progressStatus === 'kyc-started')
              .map(lead => {
                const kyc = kycs.find(k => k.leadId === lead.id);
                const kycStatus = kyc?.status || 'in-progress';
                return (
                  <div key={lead.id} className={neonLeadCardCls}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold ${neon ? 'text-cyan-200' : ''}`}>
                          {lead.name}
                        </h3>
                        <p className={`text-sm ${neon ? 'text-cyan-400/60' : mutedText}`}>
                          {lead.email}
                        </p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusBadgeCls(kycStatus)}`}>
                            {kycStatus === 'in-progress' && (
                              <Clock className="inline w-3 h-3 mr-1" />
                            )}
                            {kycStatus === 'completed' && (
                              <CheckCircle2 className="inline w-3 h-3 mr-1" />
                            )}
                            {kycStatus === 'failed' && (
                              <XCircle className="inline w-3 h-3 mr-1" />
                            )}
                            {kycStatus === 'pending' && (
                              <AlertCircle className="inline w-3 h-3 mr-1" />
                            )}
                            {kycStatus === 'in-progress' ? 'KYC in Progress' :
                              kycStatus === 'completed' ? 'Completed' :
                              kycStatus === 'failed' ? 'Failed' :
                              'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          try {
                            await updateDocument(LEADS_COLLECTION, lead.id, {
                              progressStatus: 'kyc-completed'
                            });
                            if (kyc) {
                              await updateDocument(KYCS_COLLECTION, kyc.id, {
                                status: 'completed',
                                completedDate: new Date().toISOString().split('T')[0]
                              });
                            }
                            showAlert('KYC marked as completed');
                          } catch (error) {
                            showAlert('Error updating KYC status');
                            console.error(error);
                          }
                        }}
                        className={completeBtnCls}
                      >
                        <Check className="mr-2 h-4 w-4" /> Mark as Completed
                      </Button>
                    </div>
                  </div>
                );
              })}
            
            {pendingKYC === 0 && (
              <div className={`text-center py-8 ${neon ? 'text-cyan-500/40' : 'text-gray-400'}`}>
                <Shield className={`w-10 h-10 mx-auto mb-2 ${neon ? 'text-cyan-500/30' : ''}`} />
                <p className="text-sm">No pending KYCs</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* ── KYC Process Card ── */}
      <Card className={neonCardCls}>
        <CardHeader>
          <CardTitle className={neonTitleCls}>
            <div className="flex items-center gap-2">
              <FileText className={`w-5 h-5 ${neon ? 'text-fuchsia-400' : ''}`} />
              KYC Process
            </div>
          </CardTitle>
          <CardDescription className={neonDescriptionCls}>
            Perform KYC verification for your leads before converting them to clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={neonInfoBoxCls}>
              <h4 className={`mb-3 ${neonHeadingCls}`}>
                Steps to complete KYC:
              </h4>
              <ol className="list-decimal pl-5 space-y-3">
                <li className={`flex items-start gap-2 ${neonStepTextCls}`}>
                  <UserCheck className={`w-4 h-4 mt-0.5 flex-shrink-0 ${stepIconCls('cyan')}`} />
                  <span>Click "Start KYC" on the lead</span>
                </li>
                <li className={`flex items-start gap-2 ${neonStepTextCls}`}>
                  <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${stepIconCls('fuchsia')}`} />
                  <span>Verify identity documents</span>
                </li>
                <li className={`flex items-start gap-2 ${neonStepTextCls}`}>
                  <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${stepIconCls('green')}`} />
                  <span>Verify address proof</span>
                </li>
                <li className={`flex items-start gap-2 ${neonStepTextCls}`}>
                  <Eye className={`w-4 h-4 mt-0.5 flex-shrink-0 ${stepIconCls('amber')}`} />
                  <span>Complete in-person verification if required</span>
                </li>
                <li className={`flex items-start gap-2 ${neonStepTextCls}`}>
                  <Send className={`w-4 h-4 mt-0.5 flex-shrink-0 ${stepIconCls('indigo')}`} />
                  <span>Submit for approval</span>
                </li>
              </ol>
            </div>
            
            <div className={neonLegendBoxCls}>
              <h4 className={`mb-3 ${neonHeadingCls}`}>
                KYC Status Legend:
              </h4>
              <div className="space-y-2.5">
                <div className={`flex items-center ${neonBodyTextCls}`}>
                  <span className={`w-3 h-3 rounded-full mr-2.5 ${
                    neon ? 'bg-gray-500 shadow-[0_0_6px_rgba(156,163,175,0.4)]' : 'bg-gray-300'
                  }`}></span>
                  <span>Pending</span>
                </div>
                <div className={`flex items-center ${neonBodyTextCls}`}>
                  <span className={`w-3 h-3 rounded-full mr-2.5 ${
                    neon ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]' : 'bg-yellow-300'
                  }`}></span>
                  <span>In Progress</span>
                </div>
                <div className={`flex items-center ${neonBodyTextCls}`}>
                  <span className={`w-3 h-3 rounded-full mr-2.5 ${
                    neon ? 'bg-green-500 shadow-[0_0_6px_rgba(74,222,128,0.4)]' : 'bg-green-300'
                  }`}></span>
                  <span>Completed</span>
                </div>
                <div className={`flex items-center ${neonBodyTextCls}`}>
                  <span className={`w-3 h-3 rounded-full mr-2.5 ${
                    neon ? 'bg-red-500 shadow-[0_0_6px_rgba(255,0,0,0.4)]' : 'bg-red-300'
                  }`}></span>
                  <span>Failed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}