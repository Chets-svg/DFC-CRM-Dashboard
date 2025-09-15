"use client";

import { useState } from 'react';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Phone, 
  Home, 
  CalendarDays, 
  Heart, 
  Plus 
} from "lucide-react";
import { ThemeName, themes, getButtonClasses } from '@/lib/theme';
import { Client } from '@/types/client'; // Adjust path as needed
import { SIPReminder } from '@/types/sip-reminder'; // Adjust path as needed

interface ClientDetailsModalProps {
  client: Client;
  theme: ThemeName;
  sipReminders?: SIPReminder[];
  investments?: any[];
  onNavigateToSIP: () => void;
  onNavigateToInvestments: () => void;
}

export function ViewClientDetailsModal({ 
  client, 
  theme,
  sipReminders = [], 
  investments = [],
  onNavigateToSIP,
  onNavigateToInvestments
}: ClientDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const currentTheme = themes[theme] || themes['blue-smoke'];
  
  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('');
  
  const formatDate = (dateString?: string) => 
    dateString ? new Date(dateString).toLocaleDateString() : 'Not set';

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getProductDisplayName = (productKey: string) => {
    return productKey.split(/(?=[A-Z])/).join(' ');
  };

  // Get SIP reminders for this client
  const clientSIPs = sipReminders.filter(reminder => reminder.clientId === client.id);
  
  // Get investments for this client
  const clientInvestments = investments.filter(inv => inv.clientId === client.id);
  
  // Calculate total investment value
  const totalInvestmentValue = clientInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  
  // Calculate total SIP amount
  const totalSIPAmount = clientSIPs.reduce((sum, sip) => sum + sip.amount, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`${getButtonClasses(theme, 'outline')} mt-0`}
        >
          View Details
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`${currentTheme.cardBg} ${currentTheme.borderColor} border max-w-4xl`}>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="absolute right-0 top-0 p-2"
          >
            
          </Button>
          
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-blue-500 shadow-md`}>
                <span className="text-white font-bold text-xl">
                  {getInitials(client.name)}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{client.name}</CardTitle>
                <p className={`text-sm ${currentTheme.mutedText}`}>
                  Client since {formatDate(client.createdAt)}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
                {client.address && (
                  <div className="flex items-start gap-2">
                    <span className="mt-1">
                      <Home className="h-4 w-4" />
                    </span>
                    <span>{client.address}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Personal Dates */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Personal Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                {client.dob && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Birthday</p>
                    <p className="text-sm">
                      {formatDate(client.dob)}
                    </p>
                  </div>
                )}
                {client.marriageAnniversary && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Anniversary</p>
                    <p className="text-sm">
                      {formatDate(client.marriageAnniversary)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Investment Profile */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Investment Profile</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Risk Profile:</span> 
                  <span className={`capitalize ml-2 px-2 py-1 rounded-full text-xs ${
                    client.riskProfile === 'conservative' ? 'bg-blue-100 text-blue-800' :
                    client.riskProfile === 'moderate' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {client.riskProfile}
                  </span>
                </p>
                
                <div className="mt-3">
                  <h4 className="font-medium mb-2">Products:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(client.products)
                      .filter(([_, isSelected]) => isSelected)
                      .map(([productKey]) => (
                        <span 
                          key={productKey} 
                          className={`px-3 py-1 rounded-full text-sm ${
                            productKey === 'sip' ? 'bg-blue-100 text-blue-800' :
                            productKey === 'mutualFund' ? 'bg-purple-100 text-purple-800' :
                            productKey === 'lumpsum' ? 'bg-green-100 text-green-800' :
                            productKey === 'healthInsurance' ? 'bg-teal-100 text-teal-800' :
                            productKey === 'lifeInsurance' ? 'bg-indigo-100 text-indigo-800' :
                            productKey === 'taxation' ? 'bg-orange-100 text-orange-800' :
                            productKey === 'nps' ? 'bg-pink-100 text-pink-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getProductDisplayName(productKey)}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
                       
            {/* SIP Information */}
            {client.products.sip && (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">SIP Details</h3>
                {clientSIPs.length > 0 ? (
                  <div className="space-y-3">
                    {clientSIPs.map((sip, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg ${currentTheme.highlightBg}`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{formatCurrency(sip.amount)}</p>
                            <p className="text-sm text-gray-500">
                              {sip.frequency} • Next: {formatDate(sip.nextDate)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            sip.status === 'active' ? 'bg-green-100 text-green-800' :
                            sip.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sip.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-3 rounded-lg ${currentTheme.highlightBg}`}>
                    <p className="text-sm">No active SIPs found</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setOpen(false);
                    onNavigateToSIP();
                  }}
                  className={getButtonClasses(theme, 'outline')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add SIP Reminder
                </Button>
              </div>
            )}
            
            {/* Recent Investments */}
            
            {/* Notes */}
            <div className="md:col-span-1">
              <h3 className="font-medium text-lg mb-3">Notes</h3>
              <div className={`p-2 rounded-lg ${currentTheme.highlightBg}`}>
                {client.notes || "No notes available for this client."}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className={getButtonClasses(theme, 'outline')}
            >
              Close
            </Button>
            
          </CardFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}