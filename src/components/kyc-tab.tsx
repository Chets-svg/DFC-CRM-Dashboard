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
  Shield 
} from "lucide-react";
import { ThemeName, themes, getButtonClasses } from '@/lib/theme';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  progressStatus: string;
  status: string;
  // Add other lead properties as needed
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

  // Calculate pending KYCs
  const pendingKYC = leads.filter(lead => 
    lead.progressStatus === 'kyc-started'
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <CardTitle>KYC Status ({pendingKYC})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads
              .filter(lead => lead.progressStatus === 'kyc-started')
              .map(lead => {
                const kyc = kycs.find(k => k.leadId === lead.id);
                return (
                  <div key={lead.id} className={`p-4 border rounded ${highlightBg} ${borderColor}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{lead.name}</h3>
                        <p className={`text-sm ${mutedText}`}>{lead.email}</p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800`}>
                            KYC in Progress
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
                        className={getButtonClasses(theme, 'outline')}
                      >
                        <Check className="mr-2 h-4 w-4" /> Mark as Completed
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
      
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <CardTitle>KYC Process</CardTitle>
          <CardDescription className={mutedText}>
            Perform KYC verification for your leads before converting them to clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded ${highlightBg}`}>
              <h4 className="font-bold mb-2">Steps to complete KYC:</h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Click "Start KYC" on the lead</li>
                <li>Verify identity documents</li>
                <li>Verify address proof</li>
                <li>Complete in-person verification if required</li>
                <li>Submit for approval</li>
              </ol>
            </div>
            <div className={`p-4 rounded ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'}`}>
              <h4 className="font-bold mb-2">KYC Status Legend:</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
                  <span>Pending</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-300 rounded-full mr-2"></span>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-300 rounded-full mr-2"></span>
                  <span>Completed</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-red-300 rounded-full mr-2"></span>
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