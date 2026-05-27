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
  ChevronRight,
  Home,
  Plus,
  Trash2,
  Snowflake,
  Unlock
} from "lucide-react";
import { Client } from '@/types/client';
import { SIPReminder } from '@/types/sip-reminder';
import { toast } from 'react-hot-toast';
import { ThemeName, themes } from '@/lib/theme';
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
  const [copied, setCopied] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // Freeze state
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
    if (isFrozen) {
      // Unfreezing - no reason needed
    } else {
      // Freezing - reason is required
      if (!freezeReason.trim()) {
        toast.error('Please provide a reason for freezing this client');
        return;
      }
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
      
      onFreeze();
      
      toast.success(
        isFrozen 
          ? 'Client unfrozen successfully' 
          : 'Client frozen successfully'
      );
    } catch (error) {
      console.error('Error updating client freeze status:', error);
      toast.error('Error updating client status. Please try again.');
    } finally {
      setFreezeLoading(false);
    }
  };

  return (    
    <div className={`bg-white rounded-xl shadow-sm border ${currentTheme.borderColor} overflow-hidden hover:shadow-md transition-shadow ${
      isFrozen ? 'opacity-60 grayscale-[30%]' : ''
    }`}>
      <div className={`px-3 py-2 flex justify-between items-center ${
        isFrozen 
          ? 'bg-gradient-to-r from-slate-500 to-slate-400'
          : theme === 'dark' 
            ? currentTheme.darkBgColor 
              ? `bg-gradient-to-r ${currentTheme.darkButtonBg} ${currentTheme.darkButtonHover}`
              : `bg-gradient-to-r from-gray-700 to-gray-600`
            : `bg-gradient-to-r ${currentTheme.buttonBg} ${currentTheme.buttonHover}`
      }`}>
        <div className="min-w-0">
          <h2 className="text-white font-medium truncate flex items-center gap-2">
            {client.name}
            {isFrozen && (
              <Snowflake className="h-3.5 w-3.5 text-blue-200" />
            )}
          </h2>
          <p className="text-blue-100 text-xs">Added: {formatDate(client.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1">
          {isFrozen && (
            <Badge className="bg-slate-200 text-slate-700 text-xs px-1.5 py-0.5">
              Frozen
            </Badge>
          )}
          {client.products.sip && !isFrozen && (
            <Badge className="bg-white/20 text-white text-xs px-1.5 py-0.5">
              SIP
            </Badge>
          )}
          {client.riskProfile && !isFrozen && (
            <Badge className={`
              ${client.riskProfile === 'conservative' ? 'bg-blue-100 text-blue-800' : 
                client.riskProfile === 'moderate' ? 'bg-green-100 text-green-800' : 
                'bg-amber-100 text-amber-800'}
              text-xs px-1.5 py-0.5
            `}>
              {client.riskProfile.charAt(0)}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className={`h-10 w-10 border ${isFrozen ? 'border-slate-300 grayscale' : 'border-blue-300'}`}>
              <AvatarFallback className={`${isFrozen ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white font-bold text-sm`}>
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex">
              {isFrozen && (
                <div className="bg-slate-500 rounded-full p-0.5" title="Frozen">
                  <Snowflake className="h-2.5 w-2.5 text-white" />
                </div>
              )}
              {isBirthdayThisMonth && !isFrozen && (
                <div className="bg-pink-500 rounded-full p-0.5">
                  <CalendarDays className="h-2.5 w-2.5 text-white" />
                </div>
              )}
              {isAnniversaryThisMonth && !isFrozen && (
                <div className="bg-purple-500 rounded-full p-0.5">
                  <Heart className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-sm truncate">{client.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-sm">{client.phone || 'No phone'}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs mt-1">
                {client.dob && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <CalendarDays className="w-3 h-3 text-blue-500" />
                    <span>DOB: {formatDate(client.dob)}</span>
                  </div>
                )}
                {client.marriageAnniversary && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span>Anniv: {formatDate(client.marriageAnniversary)}</span>
                  </div>
                )}
              </div>

              {client.can && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs font-medium text-gray-500">CAN:</span>
                  <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                    <span className="font-mono text-xs">{client.can}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-5 w-5 p-0 text-gray-600 hover:bg-gray-200"
                      onClick={handleCopyCAN}
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              )}
              
              {isFrozen && client.freezeReason && (
                <div className="mt-1 p-1.5 bg-slate-100 rounded text-xs text-slate-600 italic">
                  <span className="font-medium">Reason:</span> {client.freezeReason}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-100">
          {client.products.sip && !isFrozen && (
            <div className="space-y-0.5">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <User className="w-2.5 h-2.5" /> SIP
              </p>
              <p className="font-medium">
                {upcomingSIPs.length > 0 
                  ? `₹${upcomingSIPs.reduce((sum, sip) => sum + sip.amount, 0).toLocaleString()}` 
                  : 'None'}
              </p>
            </div>
          )}
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500">Investment</p>
            <p className="font-medium">
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
                  className={`text-xs px-1.5 py-0.5 capitalize ${
                    isFrozen 
                      ? 'text-slate-500 bg-slate-100 border border-slate-200'
                      : 'text-blue-600 bg-blue-50 border border-blue-100'
                  }`}
                >
                  {key.replace(/([A-Z])/g, ' $1').split(' ')[0]}
                </Badge>
              ))}
          </div>
        </div>

        <div className="pt-3 mt-2 border-t border-gray-100">
          <div className="grid grid-cols-6 gap-1.5">
            {/* Freeze/Unfreeze Button - Now matches other buttons exactly */}
            <Button 
              size="sm" 
              variant="outline" 
              className={`h-8 p-1 ${
                isFrozen 
                  ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100'
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
              className={`h-8 p-1 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={onEmail}
              disabled={isFrozen}
            >
              <Mail className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className={`h-8 p-1 text-green-600 border-green-200 bg-green-50 hover:bg-green-100 ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={onWhatsApp}
              disabled={isFrozen}
            >
              <MessageSquare className="w-3.5 h-3.5" /> 
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className={`h-8 p-1 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFrozen}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewDetails}
              className="h-8 p-1 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
            >
              <User className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteClick}
              className="h-8 p-1 text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className={`${currentTheme.cardBg} ${currentTheme.borderColor} border max-w-md p-0`}>
          <div className="relative">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow ${isFrozen ? 'bg-gray-400' : 'bg-blue-500'}`}>
                  <span className="text-white font-bold text-lg">
                    {getInitials(client.name)}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {client.name}
                    {isFrozen && (
                      <Badge className="text-xs bg-slate-200 text-slate-600">Frozen</Badge>
                    )}
                  </CardTitle>
                  <p className={`text-sm ${currentTheme.mutedText}`}>
                    Client since {formatDate(client.createdAt)}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 grid grid-cols-1 gap-4">
              {isFrozen && (
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Snowflake className="h-4 w-4" />
                    <span className="font-medium">Client Frozen</span>
                  </div>
                  {client.freezeReason && (
                    <p className="text-sm text-slate-600 mt-1 italic">
                      "{client.freezeReason}"
                    </p>
                  )}
                  {client.frozenAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Frozen on: {formatDate(client.frozenAt)}
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-3">
                <h3 className="font-medium">Contact Information</h3>
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
                      <span className="mt-0.5">
                        <Home className="h-4 w-4" />
                      </span>
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Personal Dates</h3>
                <div className="grid grid-cols-2 gap-3">
                  {client.dob && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Birthday</p>
                      <p className="text-sm">{formatDate(client.dob)}</p>
                    </div>
                  )}
                  {client.marriageAnniversary && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Anniversary</p>
                      <p className="text-sm">{formatDate(client.marriageAnniversary)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Investment Profile</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Risk:</span> 
                    <span className={`capitalize ml-2 px-2 py-1 rounded-full text-xs ${
                      client.riskProfile === 'conservative' ? 'bg-blue-100 text-blue-800' :
                      client.riskProfile === 'moderate' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {client.riskProfile}
                    </span>
                  </p>
                  
                  <div className="mt-2">
                    <h4 className="font-medium text-sm mb-2">Products:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(client.products)
                        .filter(([_, isSelected]) => isSelected)
                        .map(([productKey]) => (
                          <span 
                            key={productKey} 
                            className={`px-2 py-1 rounded-full text-xs ${
                              isFrozen ? 'bg-slate-100 text-slate-600' :
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
              
              {client.products.sip && !isFrozen && (
                <div className="space-y-3">
                  <h3 className="font-medium">SIP Details</h3>
                  {upcomingSIPs.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingSIPs.map((sip, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded ${currentTheme.highlightBg}`}
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
                    <div className={`p-2 rounded ${currentTheme.highlightBg}`}>
                      <p className="text-sm">No active SIPs found</p>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsViewDetailsOpen(false);
                      onNavigateToSIP();
                    }}
                    className="mt-2 h-8"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add SIP
                  </Button>
                </div>
              )}
              
              <div>
                <h3 className="font-medium mb-2">Notes</h3>
                <div className={`p-2 rounded ${currentTheme.highlightBg}`}>
                  {client.notes || "No notes available."}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsViewDetailsOpen(false)}
                className="h-8"
              >
                Close
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  setIsViewDetailsOpen(false);
                  onEdit();
                }}
                className="h-8"
                disabled={isFrozen}
              >
                Edit
              </Button>
            </CardFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Client
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please confirm by entering the password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="delete-password">Password</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-1"
                  placeholder="Enter password to confirm"
                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteConfirm()}
                />
                {deleteError && (
                  <p className="text-sm text-red-500 mt-1">{deleteError}</p>
                )}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">Warning:</span> Deleting this client will permanently remove all associated data including SIP reminders and investment records.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="px-4 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Freeze Confirmation Modal */}
      <Dialog open={isFreezeDialogOpen} onOpenChange={setIsFreezeDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
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
            <DialogDescription>
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
                  <Label htmlFor="freeze-reason">
                    Reason for Freezing <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="freeze-reason"
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., Client requested to stop investments, Exited from mutual funds, etc."
                    rows={3}
                  />
                </div>
              )}
              
              <div className={`rounded-lg p-3 ${isFrozen ? 'bg-green-50 border border-green-200' : 'bg-cyan-50 border border-cyan-200'}`}>
                <p className={`text-sm ${isFrozen ? 'text-green-700' : 'text-cyan-700'}`}>
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
              className="px-4"
              disabled={freezeLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFreezeConfirm}
              disabled={freezeLoading}
              className={`px-4 ${
                isFrozen 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
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