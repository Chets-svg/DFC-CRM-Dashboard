"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Edit, 
  Mail, 
  MessageSquare, 
  CalendarDays, 
  Heart,
  Phone,
  Copy,
  User,
  Home,
  Plus,
  Trash2,
  Snowflake,
  Unlock
} from "lucide-react";
import { Client } from '@/types/client';
import { SIPReminder } from '@/types/sip-reminder';
import { toast } from 'react-hot-toast';
import { ThemeName, themes, isNeon } from '@/lib/theme';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ClientCardProps {
  client: Client;
  theme: ThemeName;
  onEdit: () => void;
  onEmail: () => void;
  onWhatsApp: () => void;
  onViewDetails: () => void;
  onDelete: (clientId: string) => void;
  onFreeze: () => void;
  sipReminders: SIPReminder[];
  investments: any[];
  onNavigateToSIP: () => void;
  onNavigateToInvestments: () => void;
}

export function ClientCard({
  client,
  theme,
  onEdit,
  onEmail,
  onWhatsApp,
  onViewDetails,
  onDelete,
  onFreeze,
  sipReminders,
  investments,
  onNavigateToSIP,
  onNavigateToInvestments
}: ClientCardProps) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const neon = isNeon(theme);
  const [copied, setCopied] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const [isFreezeDialogOpen, setIsFreezeDialogOpen] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeLoading, setFreezeLoading] = useState(false);

  const isFrozen = client.isFrozen || false;

  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : 'Not set';

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getProductDisplayName = (productKey: string) => {
    return productKey.split(/(?=[A-Z])/).join(' ');
  };

  const upcomingSIPs = sipReminders.filter(r => r.clientId === client.id && r.status === 'active');
  const hasUpcomingSIP = upcomingSIPs.length > 0;
  
  const clientInvestments = investments.filter(i => i.clientId === client.id);
  const totalInvestment = clientInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);

  const today = new Date();
  const isBirthdayThisMonth = client.dob && 
    new Date(today.getFullYear(), today.getMonth(), 1) <= new Date(client.dob) && 
    new Date(client.dob) <= new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
  const isAnniversaryThisMonth = client.marriageAnniversary && 
    new Date(today.getFullYear(), today.getMonth(), 1) <= new Date(client.marriageAnniversary) && 
    new Date(client.marriageAnniversary) <= new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const handleCopyCAN = () => {
    if (client.can) {
      navigator.clipboard.writeText(client.can);
      setCopied(true);
      toast.success('CAN copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewDetails = () => {
    setIsViewDetailsOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (deletePassword === 'Rosh@1309') {
      try {
        await deleteDoc(doc(db, 'clients', client.id));
        onDelete(client.id);
        setIsDeleteDialogOpen(false);
        setDeletePassword('');
        setDeleteError('');
        toast.success('Client deleted successfully');
      } catch (error) {
        console.error('Error deleting client:', error);
        setDeleteError('Error deleting client. Please try again.');
      }
    } else {
      setDeleteError('Incorrect password. Please try again.');
    }
  };

  const handleFreezeClick = () => {
    setIsFreezeDialogOpen(true);
    setFreezeReason('');
  };

  const handleFreezeConfirm = async () => {
    if (!isFrozen && !freezeReason.trim()) {
      toast.error('Please provide a reason for freezing this client');
      return;
    }

    setFreezeLoading(true);
    
    try {
      const clientRef = doc(db, 'clients', client.id);
      
      const updateData: any = {
        isFrozen: !isFrozen,
        frozenAt: !isFrozen ? new Date().toISOString() : null,
        freezeReason: !isFrozen ? freezeReason.trim() : null,
        unfrozenAt: isFrozen ? new Date().toISOString() : null
      };

      await updateDoc(clientRef, updateData);
      
      setIsFreezeDialogOpen(false);
      setFreezeReason('');
      
      toast.success(
        isFrozen 
          ? 'Client unfrozen successfully' 
          : 'Client frozen successfully'
      );
      
      if (onFreeze) {
        onFreeze();
      }
      
    } catch (error) {
      console.error('Error updating client freeze status:', error);
      toast.error('Error updating client status. Please try again.');
    } finally {
      setFreezeLoading(false);
    }
  };

  // ── Neon helper classes aligned with dashboard ──
  const neonCardOuter = neon
    ? 'bg-slate-900 border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.06)] hover:shadow-[0_0_30px_rgba(0,255,255,0.12)] hover:border-cyan-400/30'
    : `bg-white ${currentTheme.borderColor}`;

  const neonHeaderBg = neon
    ? 'bg-slate-800 border-b border-cyan-500/20'
    : theme === 'dark'
      ? 'bg-gray-700'
      : `${currentTheme.buttonBg}`;

  const neonAvatarBg = isFrozen
    ? 'from-slate-400 to-slate-500'
    : neon
      ? 'from-cyan-500 to-fuchsia-600'
      : 'from-blue-500 to-indigo-600';

  const neonAvatarBorder = isFrozen
    ? 'border-slate-400'
    : neon
      ? 'border-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.3)]'
      : 'border-blue-300';

  const neonInputCls = neon
    ? 'bg-slate-900 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-600/50 focus:border-cyan-400 focus:ring-cyan-500/20'
    : '';

  const neonMutedText = neon ? 'text-cyan-400/60' : currentTheme.mutedText;

  const neonSectionTitle = neon
    ? 'text-cyan-400 font-semibold tracking-wide uppercase text-xs drop-shadow-[0_0_4px_rgba(0,255,255,0.15)]'
    : 'font-medium';

  const neonHighlightBg = neon ? 'bg-cyan-500/5' : currentTheme.highlightBg;

  // Product badge neon colors — aligned with dashboard
  const productBadgeCls = (key: string) => {
    if (isFrozen) return 'text-slate-600 bg-slate-100 border border-slate-200';
    if (!neon) {
      return key === 'sip' ? 'text-blue-600 bg-blue-50 border border-blue-100' :
        key === 'mutualFund' ? 'text-purple-600 bg-purple-50 border border-purple-100' :
        key === 'lumpsum' ? 'text-green-600 bg-green-50 border border-green-100' :
        'text-blue-600 bg-blue-50 border border-blue-100';
    }
    return key === 'sip' ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30' :
      key === 'mutualFund' ? 'text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/30' :
      key === 'lumpsum' ? 'text-green-300 bg-green-500/10 border border-green-500/30' :
      key === 'healthInsurance' ? 'text-teal-300 bg-teal-500/10 border border-teal-500/30' :
      key === 'lifeInsurance' ? 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/30' :
      key === 'taxation' ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30' :
      key === 'nps' ? 'text-pink-300 bg-pink-500/10 border border-pink-500/30' :
      'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30';
  };

  // Product detail badge in modal
  const productDetailBadgeCls = (key: string) => {
    if (isFrozen) return 'bg-slate-100 text-slate-600';
    if (neon) {
      return key === 'sip' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' :
        key === 'mutualFund' ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20' :
        key === 'lumpsum' ? 'bg-green-500/10 text-green-300 border border-green-500/20' :
        key === 'healthInsurance' ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' :
        key === 'lifeInsurance' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
        key === 'taxation' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
        key === 'nps' ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20' :
        'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20';
    }
    return key === 'sip' ? 'bg-blue-100 text-blue-800' :
      key === 'mutualFund' ? 'bg-purple-100 text-purple-800' :
      key === 'lumpsum' ? 'bg-green-100 text-green-800' :
      key === 'healthInsurance' ? 'bg-teal-100 text-teal-800' :
      key === 'lifeInsurance' ? 'bg-indigo-100 text-indigo-800' :
      key === 'taxation' ? 'bg-orange-100 text-orange-800' :
      key === 'nps' ? 'bg-pink-100 text-pink-800' :
      'bg-gray-100 text-gray-800';
  };

  // Risk profile badge
  const riskBadgeCls = () => {
    if (neon) {
      return client.riskProfile === 'conservative' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' :
        client.riskProfile === 'moderate' ? 'bg-green-500/10 text-green-300 border border-green-500/30' :
        'bg-amber-500/10 text-amber-300 border border-amber-500/30';
    }
    return client.riskProfile === 'conservative' ? 'bg-blue-100 text-blue-800' :
      client.riskProfile === 'moderate' ? 'bg-green-100 text-green-800' :
      'bg-amber-100 text-amber-800';
  };

  // SIP status badge
  const sipStatusBadgeCls = (status: string) => {
    if (neon) {
      return status === 'active' ? 'bg-green-500/10 text-green-300 border border-green-500/30' :
        status === 'paused' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' :
        'bg-slate-800 text-slate-400 border border-slate-600';
    }
    return status === 'active' ? 'bg-green-100 text-green-800' :
      status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
      'bg-gray-100 text-gray-800';
  };

  // Dialog content classes — aligned with dashboard
  const dialogCls = neon
    ? 'bg-slate-900 border-cyan-500/20 shadow-[0_0_40px_rgba(0,255,255,0.08)]'
    : `${currentTheme.cardBg} ${currentTheme.borderColor} border`;

  const dangerDialogCls = neon
    ? 'bg-slate-900 border-red-500/20 shadow-[0_0_40px_rgba(255,0,0,0.06)]'
    : 'bg-white';

  const freezeDialogCls = neon
    ? 'bg-slate-900 border-cyan-500/20 shadow-[0_0_40px_rgba(0,255,255,0.08)]'
    : 'bg-white';

  return (    
    <div className={`rounded-xl shadow-sm border overflow-hidden transition-all duration-200 ${neonCardOuter}`}>
      {/* Header */}
      <div className={`px-3 py-2 flex justify-between items-center ${neonHeaderBg}`}>
        <div className="min-w-0">
          <h2 className={`font-medium truncate flex items-center gap-2 ${
            neon ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]' : 'text-white'
          }`}>
            {client.name}
            {isFrozen && (
              <Snowflake className={`h-3.5 w-3.5 ${neon ? 'text-cyan-400' : 'text-blue-200'}`} />
            )}
          </h2>
          <p className={`text-xs ${neon ? 'text-cyan-200/70' : 'text-blue-100'}`}>
            Added: {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isFrozen && (
            <Badge className={`text-xs px-1.5 py-0.5 flex items-center gap-1 ${
              neon ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/30 text-white'
            }`}>
              <Snowflake className="h-3 w-3" />
              Frozen
            </Badge>
          )}
          {client.products.sip && (
            <Badge className={`text-xs px-1.5 py-0.5 ${
              neon ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' : 'bg-white/20 text-white'
            }`}>
              SIP
            </Badge>
          )}
          {client.riskProfile && (
            <Badge className={`${riskBadgeCls()} text-xs px-1.5 py-0.5`}>
              {client.riskProfile.charAt(0)}
            </Badge>
          )}
        </div>
      </div>

      <div className={`p-3 ${neon ? 'bg-slate-900' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className={`h-10 w-10 border ${neonAvatarBorder}`}>
              <AvatarFallback className={`bg-gradient-to-r ${neonAvatarBg} text-white font-bold text-sm`}>
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex">
              {isFrozen && (
                <div className={`rounded-full p-0.5 ${neon ? 'bg-cyan-500/30 shadow-[0_0_6px_rgba(0,255,255,0.2)]' : 'bg-slate-500'}`} title="Frozen">
                  <Snowflake className={`h-2.5 w-2.5 ${neon ? 'text-cyan-300' : 'text-white'}`} />
                </div>
              )}
              {isBirthdayThisMonth && !isFrozen && (
                <div className={`rounded-full p-0.5 ${neon ? 'bg-fuchsia-500/30 shadow-[0_0_6px_rgba(232,121,249,0.2)]' : 'bg-pink-500'}`}>
                  <CalendarDays className={`h-2.5 w-2.5 ${neon ? 'text-fuchsia-300' : 'text-white'}`} />
                </div>
              )}
              {isAnniversaryThisMonth && !isFrozen && (
                <div className={`rounded-full p-0.5 ${neon ? 'bg-pink-500/30 shadow-[0_0_6px_rgba(236,72,153,0.2)]' : 'bg-purple-500'}`}>
                  <Heart className={`h-2.5 w-2.5 ${neon ? 'text-pink-300' : 'text-white'}`} />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="space-y-1.5">
              <div className={`flex items-center gap-1.5 ${neon ? 'text-slate-300' : 'text-gray-600'}`}>
                <Mail className={`w-3.5 h-3.5 flex-shrink-0 ${neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : 'text-blue-500'}`} />
                <span className="text-sm truncate">{client.email || 'No email'}</span>
              </div>
              <div className={`flex items-center gap-1.5 ${neon ? 'text-slate-300' : 'text-gray-600'}`}>
                <Phone className={`w-3.5 h-3.5 flex-shrink-0 ${neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : 'text-blue-500'}`} />
                <span className="text-sm">{client.phone || 'No phone'}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs mt-1">
                {client.dob && (
                  <div className={`flex items-center gap-1 ${neon ? 'text-cyan-400/70' : 'text-gray-500'}`}>
                    <CalendarDays className={`w-3 h-3 ${neon ? 'text-cyan-400' : 'text-blue-500'}`} />
                    <span>DOB: {formatDate(client.dob)}</span>
                  </div>
                )}
                {client.marriageAnniversary && (
                  <div className={`flex items-center gap-1 ${neon ? 'text-fuchsia-400/70' : 'text-gray-500'}`}>
                    <Heart className={`w-3 h-3 ${neon ? 'text-fuchsia-400 drop-shadow-[0_0_4px_rgba(232,121,249,0.3)]' : 'text-pink-500'}`} />
                    <span>Anniv: {formatDate(client.marriageAnniversary)}</span>
                  </div>
                )}
              </div>

              {client.can && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className={`text-xs font-medium ${neon ? 'text-cyan-400/60' : 'text-gray-500'}`}>CAN:</span>
                  <div className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${
                    neon ? 'bg-cyan-500/5 border border-cyan-500/20' : 'bg-gray-100'
                  }`}>
                    <span className={`font-mono text-xs ${neon ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' : ''}`}>{client.can}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={`h-5 w-5 p-0 ${
                        neon ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300' : 'text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={handleCopyCAN}
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              )}
              
              {isFrozen && client.freezeReason && (
                <div className={`mt-1 p-1.5 rounded text-xs italic ${
                  neon ? 'bg-cyan-500/5 border border-cyan-500/10 text-cyan-400/70' : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="font-medium">Reason:</span> {client.freezeReason}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-2 mt-3 pt-2 border-t ${neon ? 'border-cyan-500/10' : 'border-gray-100'}`}>
          {client.products.sip && (
            <div className="space-y-0.5">
              <p className={`text-xs flex items-center gap-1 ${neon ? 'text-cyan-400/60' : 'text-gray-500'}`}>
                <User className="w-2.5 h-2.5" /> SIP
              </p>
              <p className={`font-medium ${neon ? 'text-cyan-200' : ''}`}>
                {upcomingSIPs.length > 0 
                  ? `₹${upcomingSIPs.reduce((sum, sip) => sum + sip.amount, 0).toLocaleString()}` 
                  : 'None'}
              </p>
            </div>
          )}
          <div className="space-y-0.5">
            <p className={`text-xs ${neon ? 'text-cyan-400/60' : 'text-gray-500'}`}>Investment</p>
            <p className={`font-medium ${neon ? 'text-cyan-200' : ''}`}>
              {totalInvestment > 0 
                ? `₹${totalInvestment.toLocaleString()}` 
                : 'None'}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex flex-wrap gap-1">
            {Object.entries(client.products)
              .filter(([_, value]) => value)
              .map(([key]) => (
                <Badge 
                  key={key} 
                  className={`text-xs px-1.5 py-0.5 capitalize ${productBadgeCls(key)}`}
                >
                  {key.replace(/([A-Z])/g, ' $1').split(' ')[0]}
                </Badge>
              ))}
          </div>
        </div>

        <div className={`pt-3 mt-2 border-t ${neon ? 'border-cyan-500/10' : 'border-gray-100'}`}>
          <div className="grid grid-cols-6 gap-1.5">
            <Button 
              size="sm" 
              variant="outline" 
              className={`rounded-lg transition-all duration-200 ${
                isFrozen
                  ? neon
                    ? 'text-green-400 border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-400 hover:shadow-[0_0_10px_rgba(74,222,128,0.15)]'
                    : 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100'
                  : neon
                    ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,255,255,0.15)]'
                    : 'text-cyan-600 border-cyan-200 bg-cyan-50 hover:bg-cyan-100'
              }`}
              onClick={handleFreezeClick}
              title={isFrozen ? 'Unfreeze Client' : 'Freeze Client'}
            >
              {isFrozen ? (
                <Unlock className="w-3.5 h-3.5" />
              ) : (
                <Snowflake className="w-3.5 h-3.5" />
              )}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className={`rounded-lg transition-all duration-200 ${
                neon
                  ? 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 hover:border-fuchsia-400 hover:shadow-[0_0_10px_rgba(232,121,249,0.15)]'
                  : 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100'
              } ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onEmail}
              disabled={isFrozen}
            >
              <Mail className="w-3.5 h-3.5" />
            </Button>

            <Button 
              size="sm" 
              variant="outline" 
              className={`rounded-lg transition-all duration-200 ${
                neon
                  ? 'text-green-400 border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-400 hover:shadow-[0_0_10px_rgba(74,222,128,0.15)]'
                  : 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100'
              } ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onWhatsApp}
              disabled={isFrozen}
            >
              <MessageSquare className="w-3.5 h-3.5" /> 
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className={`rounded-lg transition-all duration-200 ${
                neon
                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-400 hover:shadow-[0_0_10px_rgba(251,191,36,0.15)]'
                  : 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100'
              } ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFrozen}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewDetails}
              className={`rounded-lg transition-all duration-200 ${
                neon
                  ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-400 hover:shadow-[0_0_10px_rgba(129,140,248,0.15)]'
                  : 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100'
              }`}
            >
              <User className="h-3.5 w-3.5" />
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteClick}
              className={`rounded-lg transition-all duration-200 ${
                neon
                  ? 'text-red-400 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-400 hover:shadow-[0_0_10px_rgba(255,0,0,0.15)]'
                  : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
            {/* ── View Details Modal ── */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className={`${dialogCls} max-w-md p-0`}>
          <div className="relative">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow ${
                  isFrozen
                    ? 'bg-gradient-to-r from-slate-400 to-slate-500'
                    : neon
                      ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 shadow-[0_0_15px_rgba(0,255,255,0.25)]'
                      : 'bg-blue-500'
                }`}>
                  <span className="text-white font-bold text-lg">
                    {getInitials(client.name)}
                  </span>
                </div>
                <div>
                  <CardTitle className={`text-xl flex items-center gap-2 ${
                    neon ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]' : ''
                  }`}>
                    {client.name}
                    {isFrozen && (
                      <Badge className={`text-xs flex items-center gap-1 ${
                        neon ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Snowflake className="h-3 w-3" />
                        Frozen
                      </Badge>
                    )}
                  </CardTitle>
                  <p className={`text-sm ${neonMutedText}`}>
                    Client since {formatDate(client.createdAt)}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 grid grid-cols-1 gap-4">
              {isFrozen && (
                <div className={`p-3 rounded-lg border ${
                  neon ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className={`flex items-center gap-2 ${neon ? 'text-cyan-300' : 'text-slate-700'}`}>
                    <Snowflake className={`h-4 w-4 ${neon ? 'drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''}`} />
                    <span className="font-medium">Client Frozen</span>
                  </div>
                  {client.freezeReason && (
                    <p className={`text-sm mt-1 italic ${neon ? 'text-cyan-400/70' : 'text-slate-600'}`}>
                      "{client.freezeReason}"
                    </p>
                  )}
                  {client.frozenAt && (
                    <p className={`text-xs mt-1 ${neon ? 'text-cyan-400/50' : 'text-slate-500'}`}>
                      Frozen on: {formatDate(client.frozenAt)}
                    </p>
                  )}
                </div>
              )}
              
              <div className={`space-y-3 p-3 rounded-xl ${neon ? 'bg-cyan-500/5 border border-cyan-500/10' : ''}`}>
                <h3 className={neonSectionTitle}>Contact Information</h3>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${neon ? 'text-slate-300' : ''}`}>
                    <Mail className={`h-4 w-4 ${neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''}`} />
                    <span>{client.email}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${neon ? 'text-slate-300' : ''}`}>
                    <Phone className={`h-4 w-4 ${neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''}`} />
                    <span>{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className={`flex items-start gap-2 ${neon ? 'text-slate-300' : ''}`}>
                      <span className="mt-0.5">
                        <Home className={`h-4 w-4 ${neon ? 'text-cyan-400' : ''}`} />
                      </span>
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`space-y-3 p-3 rounded-xl ${neon ? 'bg-fuchsia-500/5 border border-fuchsia-500/10' : ''}`}>
                <h3 className={neon ? 'text-fuchsia-400 font-semibold tracking-wide uppercase text-xs drop-shadow-[0_0_4px_rgba(232,121,249,0.15)]' : neonSectionTitle}>
                  Personal Dates
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {client.dob && (
                    <div>
                      <p className={`text-xs font-medium ${neon ? 'text-fuchsia-400/60' : 'text-gray-500'}`}>Birthday</p>
                      <p className={`text-sm ${neon ? 'text-slate-300' : ''}`}>{formatDate(client.dob)}</p>
                    </div>
                  )}
                  {client.marriageAnniversary && (
                    <div>
                      <p className={`text-xs font-medium ${neon ? 'text-fuchsia-400/60' : 'text-gray-500'}`}>Anniversary</p>
                      <p className={`text-sm ${neon ? 'text-slate-300' : ''}`}>{formatDate(client.marriageAnniversary)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`space-y-3 p-3 rounded-xl ${neon ? 'bg-green-500/5 border border-green-500/10' : ''}`}>
                <h3 className={neon ? 'text-green-400 font-semibold tracking-wide uppercase text-xs drop-shadow-[0_0_4px_rgba(74,222,128,0.15)]' : neonSectionTitle}>
                  Investment Profile
                </h3>
                <div className="space-y-2">
                  <p className={neon ? 'text-slate-300' : ''}>
                    <span className="font-medium">Risk:</span> 
                    <span className={`capitalize ml-2 px-2 py-1 rounded-full text-xs ${riskBadgeCls()}`}>
                      {client.riskProfile}
                    </span>
                  </p>
                  
                  <div className="mt-2">
                    <h4 className={`font-medium text-sm mb-2 ${neon ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.15)]' : ''}`}>Products:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(client.products)
                        .filter(([_, isSelected]) => isSelected)
                        .map(([productKey]) => (
                          <span 
                            key={productKey} 
                            className={`px-2 py-1 rounded-full text-xs ${productDetailBadgeCls(productKey)}`}
                          >
                            {getProductDisplayName(productKey)}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {client.products.sip && !isFrozen && (
                <div className={`space-y-3 p-3 rounded-xl ${neon ? 'bg-amber-500/5 border border-amber-500/10' : ''}`}>
                  <h3 className={neon ? 'text-amber-400 font-semibold tracking-wide uppercase text-xs drop-shadow-[0_0_4px_rgba(251,191,36,0.15)]' : neonSectionTitle}>
                    SIP Details
                  </h3>
                  {upcomingSIPs.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingSIPs.map((sip, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded ${neonHighlightBg}`}
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className={`font-medium ${neon ? 'text-slate-200' : ''}`}>{formatCurrency(sip.amount)}</p>
                              <p className={`text-sm ${neon ? 'text-cyan-400/60' : 'text-gray-500'}`}>
                                {sip.frequency} • Next: {formatDate(sip.nextDate)}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${sipStatusBadgeCls(sip.status)}`}>
                              {sip.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-2 rounded ${neonHighlightBg}`}>
                      <p className={`text-sm ${neon ? 'text-cyan-400/60' : ''}`}>No active SIPs found</p>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsViewDetailsOpen(false);
                      onNavigateToSIP();
                    }}
                    className={`mt-2 h-8 rounded-lg transition-all duration-200 ${
                      neon
                        ? 'border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-400 hover:shadow-[0_0_10px_rgba(251,191,36,0.15)]'
                        : ''
                    }`}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add SIP
                  </Button>
                </div>
              )}
              
              <div>
                <h3 className={`mb-2 ${neonSectionTitle}`}>Notes</h3>
                <div className={`p-2 rounded ${neonHighlightBg}`}>
                  <span className={neon ? 'text-slate-300' : ''}>
                    {client.notes || "No notes available."}
                  </span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsViewDetailsOpen(false)}
                className={`h-8 rounded-lg transition-all duration-200 ${
                  neon ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400' : ''
                }`}
              >
                Close
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  setIsViewDetailsOpen(false);
                  onEdit();
                }}
                className={`h-8 rounded-lg transition-all duration-200 ${
                  neon
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-semibold shadow-[0_0_15px_rgba(0,255,255,0.25)]'
                    : ''
                }`}
                disabled={isFrozen}
              >
                Edit
              </Button>
            </CardFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={`sm:max-w-md ${dangerDialogCls}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${neon ? 'text-red-400 drop-shadow-[0_0_6px_rgba(255,0,0,0.3)]' : ''}`}>
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Client
            </DialogTitle>
            <DialogDescription className={neon ? 'text-red-400/60' : ''}>
              This action cannot be undone. Please confirm by entering the password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="delete-password" className={neon ? 'text-red-300/80' : ''}>Password</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={`mt-1 ${neonInputCls}`}
                  placeholder="Enter password to confirm"
                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteConfirm()}
                />
                {deleteError && (
                  <p className="text-sm text-red-500 mt-1">{deleteError}</p>
                )}
              </div>
              <div className={`rounded-lg p-3 ${
                neon
                  ? 'bg-red-500/5 border border-red-500/20'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${neon ? 'text-red-300/80' : 'text-red-700'}`}>
                  <span className="font-medium">Warning:</span> Deleting this client will permanently remove all associated data including SIP reminders and investment records.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className={`px-4 rounded-lg transition-all duration-200 ${
                neon ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400' : ''
              }`}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className={`px-4 rounded-lg transition-all duration-200 ${
                neon
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Freeze Confirmation Modal ── */}
      <Dialog open={isFreezeDialogOpen} onOpenChange={setIsFreezeDialogOpen}>
        <DialogContent className={`sm:max-w-md ${freezeDialogCls}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${
              neon 
                ? (isFrozen 
                    ? 'text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.3)]' 
                    : 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]') 
                : ''
            }`}>
              {isFrozen ? (
                <>
                  <Unlock className="h-5 w-5 text-green-500" />
                  Unfreeze Client
                </>
              ) : (
                <>
                  <Snowflake className="h-5 w-5 text-cyan-500" />
                  Freeze Client
                </>
              )}
            </DialogTitle>
            <DialogDescription className={neon ? 'text-cyan-400/60' : ''}>
              {isFrozen
                ? `You are about to unfreeze "${client.name}". This will restore the client to active status.`
                : `You are about to freeze "${client.name}". This client will be marked as inactive.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {!isFrozen && (
                <div>
                  <Label htmlFor="freeze-reason" className={neon ? 'text-cyan-300/80' : ''}>
                    Reason for Freezing <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="freeze-reason"
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    className={`mt-1 ${neonInputCls}`}
                    placeholder="e.g., Client requested to stop investments, Exited from mutual funds, etc."
                    rows={3}
                  />
                </div>
              )}
              
              <div className={`rounded-lg p-3 ${
                isFrozen
                  ? neon
                    ? 'bg-green-500/5 border border-green-500/20'
                    : 'bg-green-50 border border-green-200'
                  : neon
                    ? 'bg-cyan-500/5 border border-cyan-500/20'
                    : 'bg-cyan-50 border border-cyan-200'
              }`}>
                <p className={`text-sm ${
                  isFrozen
                    ? neon ? 'text-green-300/80' : 'text-green-700'
                    : neon ? 'text-cyan-300/80' : 'text-cyan-700'
                }`}>
                  {isFrozen ? (
                    <>
                      <span className="font-medium">Note:</span> Unfreezing will restore full access to the client profile and enable all actions.
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Note:</span> Frozen clients will be visually marked and their actions will be limited. You can unfreeze them at any time.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsFreezeDialogOpen(false)}
              className={`px-4 rounded-lg transition-all duration-200 ${
                neon ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400' : ''
              }`}
              disabled={freezeLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFreezeConfirm}
              disabled={freezeLoading}
              className={`px-4 rounded-lg transition-all duration-200 ${
                isFrozen
                  ? neon
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  : neon
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-semibold shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              {freezeLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : isFrozen ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Confirm Unfreeze
                </>
              ) : (
                <>
                  <Snowflake className="mr-2 h-4 w-4" />
                  Confirm Freeze
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}