"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Mail, 
  MessageSquare, 
  CalendarDays, 
  Heart,
  Table,
  Grid3X3,
  User,
  Phone,
  Mail as MailIcon,
  Calendar,
  CreditCard,
  Trash2,
  Copy,
  Snowflake
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ClientDetailsModal } from './ClientDetailsModal';
import { EditClientModal } from "@/components/EditClientModal";
import { ClientCard } from './ClientCard';
import { ThemeName, themes, getButtonClasses, isNeon } from '@/lib/theme';
import { Client } from '@/types/client';
import { SIPReminder } from './sip-reminder';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';
import { doc, getDoc, setDoc, } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ClientSortField = 'createdAt' | 'name' | 'products';
type ViewMode = 'grid' | 'list';
type ClientTab = 'mutual-funds' | 'other' | 'frozen';

interface ClientsTabProps {
  theme: ThemeName;
  clients: Client[];
  sipReminders: SIPReminder[];
  investments: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clientSortField: ClientSortField;
  setClientSortField: (field: ClientSortField) => void;
  clientSortDirection: 'asc' | 'desc';
  setClientSortDirection: (direction: 'asc' | 'desc') => void;
  setActiveTab: (tab: string) => void;
  setEmailComponentProps: (props: { defaultRecipient: string; openCompose: boolean }) => void;
  showAlert: (message: string) => void;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<boolean>;
  setEditingClient: (client: Client | null) => void;
  editingClient: Client | null;
  onDeleteClient: (id: string) => void;
  userId: string;
  setClients: (clients: Client[]) => void;
  onRefreshClients?: () => void;
}

export default function ClientsTab({
  theme,
  clients,
  sipReminders,
  investments,
  searchTerm,
  setSearchTerm,
  clientSortField,
  setClientSortField,
  clientSortDirection,
  setClientSortDirection,
  setActiveTab,
  setEmailComponentProps,
  showAlert,
  updateClient,
  setEditingClient,
  editingClient,
  onDeleteClient,
  userId,
  setClients,
  onRefreshClients
}: ClientsTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeClientTab, setActiveClientTab] = useState<ClientTab>('mutual-funds');
  
  
  const [loading, setLoading] = useState(true);
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const neon = isNeon(theme);
  const { cardBg, borderColor, inputBg, textColor, highlightBg, mutedText } = currentTheme;

  // Load user preferences on component mount
  useEffect(() => {
  const loadUserPreferences = async () => {
    if (!userId) return;
    
    try {
      // Use the imported "doc" function from firebase/firestore
      const docRef = doc(db, 'userPreferences', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.clientViewMode && (data.clientViewMode === 'grid' || data.clientViewMode === 'list')) {
          setViewMode(data.clientViewMode);
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  loadUserPreferences();
}, [userId]);

  // Save view mode preference when it changes
  const updateViewMode = async (newViewMode: ViewMode) => {
  setViewMode(newViewMode);
  
  if (!userId) return;
  
  try {
    const docRef = doc(db, 'userPreferences', userId);
    await setDoc(docRef, { clientViewMode: newViewMode }, { merge: true });
  } catch (error) {
    console.error('Error saving view mode preference:', error);
  }
};

  const getClientPrimaryProduct = (client: Client) => {
    if (client.products.mutualFund || client.products.sip || client.products.lumpsum) {
      return 'mutualFund';
    }
    if (client.products.healthInsurance) return 'healthInsurance';
    if (client.products.lifeInsurance) return 'lifeInsurance';
    if (client.products.taxation) return 'taxation';
    if (client.products.nps) return 'nps';
    return 'mutualFund';
  };

  // Segregate clients based on primary product and frozen status
  const segregateClients = () => {
    const mutualFundClients: Client[] = [];
    const otherClients: Client[] = [];
    const frozenClients: Client[] = [];

    clients.forEach(client => {
      if (client.isFrozen) {
        frozenClients.push(client);
        return;
      }

      const primaryProduct = getClientPrimaryProduct(client);
      if (primaryProduct === 'mutualFund') {
        mutualFundClients.push(client);
      } else {
        otherClients.push(client);
      }
    });

    return { mutualFundClients, otherClients, frozenClients };
  };

  const { mutualFundClients, otherClients, frozenClients } = segregateClients();

  // Get clients based on active tab
  const getActiveClients = () => {
    switch (activeClientTab) {
      case 'mutual-funds':
        return mutualFundClients;
      case 'other':
        return otherClients;
      case 'frozen':
        return frozenClients;
      default:
        return mutualFundClients;
    }
  };

  const filteredClients = getActiveClients()
    .filter(client => 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.can?.includes(searchTerm)
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (clientSortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (clientSortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (clientSortField === 'products') {
        const productA = getClientPrimaryProduct(a);
        const productB = getClientPrimaryProduct(b);
        comparison = productA.localeCompare(productB);
      }
      
      return clientSortDirection === 'asc' ? comparison : -comparison;
    });
    console.log("========== RENDER ==========", {
  searchTerm,
  activeClientTab,
  mutualFundClients: mutualFundClients.length,
  otherClients: otherClients.length,
  frozenClients: frozenClients.length,
  filteredClients: filteredClients.length,
});

  const getProductBadges = (client: Client) => {
    const badges = [];
    if (client.products.mutualFund) badges.push('Mutual Fund');
    if (client.products.sip) badges.push('SIP');
    if (client.products.lumpsum) badges.push('Lumpsum');
    if (client.products.healthInsurance) badges.push('Health Insurance');
    if (client.products.lifeInsurance) badges.push('Life Insurance');
    if (client.products.taxation) badges.push('Taxation');
    if (client.products.nps) badges.push('NPS');
    return badges;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Calculate investment data for list view
  const getClientInvestmentData = (clientId: string) => {
    const clientSIPs = sipReminders.filter(r => r.clientId === clientId && r.status === 'active');
    const clientInvestments = investments.filter(i => i.clientId === clientId);
    const totalInvestment = clientInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const sipAmount = clientSIPs.reduce((sum, sip) => sum + sip.amount, 0);
    
    return {
      totalInvestment,
      sipAmount,
      hasSIP: clientSIPs.length > 0
    };
  };

  // Check for important dates
  const getClientDateStatus = (client: Client) => {
    const today = new Date();
    const isBirthdayThisMonth = client.dob && 
      new Date(today.getFullYear(), today.getMonth(), 1) <= new Date(client.dob) && 
      new Date(client.dob) <= new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
    const isAnniversaryThisMonth = client.marriageAnniversary && 
      new Date(today.getFullYear(), today.getMonth(), 1) <= new Date(client.marriageAnniversary) && 
      new Date(client.marriageAnniversary) <= new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
    return { isBirthdayThisMonth, isAnniversaryThisMonth };
  };

  const handleCopyCAN = (can: string) => {
    if (can) {
      navigator.clipboard.writeText(can);
      toast.success('CAN copied to clipboard');
    }
  };

  
  const handleFreezeUpdate = () => {
    if (onRefreshClients) {
      onRefreshClients();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
          neon ? 'border-cyan-400' : 'border-blue-500'
        }`}></div>
      </div>
    );
  }

  return (
    <Card className={`${cardBg} ${borderColor} ${
      neon ? 'shadow-[0_0_20px_rgba(0,255,255,0.06)] border-cyan-500/20' : ''
    }`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className={neon ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]' : ''}>
            Client Management
          </CardTitle>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
  type="search"
  name="no-autofill-search-938472"
  autoComplete="new-password"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
            </div>

            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => updateViewMode('grid')}
                className={`rounded-full transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? neon 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-gray-950 shadow-[0_0_10px_rgba(0,255,255,0.2)]' 
                      : getButtonClasses(theme)
                    : neon 
                      ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400' 
                      : ''
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => updateViewMode('list')}
                className={`rounded-full transition-all duration-200 ${
                  viewMode === 'list' 
                    ? neon 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-gray-950 shadow-[0_0_10px_rgba(0,255,255,0.2)]' 
                      : getButtonClasses(theme)
                    : neon 
                      ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400' 
                      : ''
                }`}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={() => setActiveTab("leads")}
              className={`rounded-full transition-all duration-200 ${
                neon
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-semibold shadow-[0_0_15px_rgba(0,255,255,0.25)]'
                  : getButtonClasses(theme)
              }`}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
            
            <div className="flex items-center gap-2">
              <Select
                value={clientSortField}
                onValueChange={(value) => setClientSortField(value as ClientSortField)}
              >
                <SelectTrigger className={`w-[180px] rounded-full ${
                  neon
                    ? 'bg-slate-900 border-cyan-500/30 text-slate-300 hover:border-cyan-400 focus:ring-cyan-500/20'
                    : `${inputBg} ${borderColor}`
                }`}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className={`${
                  neon
                    ? 'bg-slate-900 border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.1)]'
                    : `${cardBg} ${borderColor}`
                }`}>
                  <SelectItem value="createdAt" className={`${
                    neon ? 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 focus:bg-cyan-500/10 focus:text-cyan-300' : textColor
                  }`}>Date Created</SelectItem>
                  <SelectItem value="name" className={`${
                    neon ? 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 focus:bg-cyan-500/10 focus:text-cyan-300' : textColor
                  }`}>Name</SelectItem>
                  <SelectItem value="products" className={`${
                    neon ? 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 focus:bg-cyan-500/10 focus:text-cyan-300' : textColor
                  }`}>Primary Product</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClientSortDirection(clientSortDirection === 'asc' ? 'desc' : 'asc')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  neon 
                    ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300' 
                    : ''
                }`}
              >
                {clientSortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Client Tabs */}
        <div className={`flex border-b mt-4 ${
          neon ? 'border-cyan-500/20' : 'border-gray-200'
        }`}>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeClientTab === 'mutual-funds'
                ? neon
                  ? 'border-b-2 border-cyan-500 text-cyan-300'
                  : 'border-b-2 border-blue-500 text-blue-600'
                : neon
                  ? 'text-slate-400 hover:text-cyan-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveClientTab('mutual-funds')}
          >
            Mutual Funds Clients
            <Badge variant="secondary" className={`ml-1 ${
              neon
                ? activeClientTab === 'mutual-funds'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400'
                : ''
            }`}>
              {mutualFundClients.length}
            </Badge>
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeClientTab === 'other'
                ? neon
                  ? 'border-b-2 border-cyan-500 text-cyan-300'
                  : 'border-b-2 border-blue-500 text-blue-600'
                : neon
                  ? 'text-slate-400 hover:text-cyan-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveClientTab('other')}
          >
            Other Clients
            <Badge variant="secondary" className={`ml-1 ${
              neon
                ? activeClientTab === 'other'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400'
                : ''
            }`}>
              {otherClients.length}
            </Badge>
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeClientTab === 'frozen'
                ? neon
                  ? 'border-b-2 border-cyan-500 text-cyan-300'
                  : 'border-b-2 border-cyan-500 text-cyan-600'
                : neon
                  ? 'text-slate-400 hover:text-cyan-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveClientTab('frozen')}
          >
            <Snowflake className={`h-4 w-4 ${neon ? 'drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''}`} />
            Frozen Clients
            <Badge variant="secondary" className={`ml-1 ${
              neon
                ? activeClientTab === 'frozen'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {frozenClients.length}
            </Badge>
          </button>
        </div>
      </CardHeader>
            <CardContent>
        {viewMode === 'grid' ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.length === 0 ? (
              <div className={`col-span-full text-center py-8 ${
                neon ? 'text-cyan-400/60' : 'text-gray-500'
              }`}>
                {activeClientTab === 'frozen' 
                  ? 'No frozen clients found.'
                  : 'No clients found. Try adjusting your search.'}
              </div>
            ) : (
              
              filteredClients.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  theme={theme}
                  onEdit={() => setEditingClient(client)}
                  onEmail={() => {
                    setActiveTab("email");
                    setEmailComponentProps({
                      defaultRecipient: client.email,
                      openCompose: true
                    });
                  }}
                  onWhatsApp={() => {
                    window.open(
                      `https://api.whatsapp.com/send/?phone=91${client.phone}&text=${encodeURIComponent(
                        `Hi ${client.name}, this is from Dhanam Financial Services. Let's connect!`
                      )}&type=phone_number&app_absent=0`,
                      '_blank'
                    );
                  }}
                  onViewDetails={() => {
                    console.log("View details for:", client.name);
                  }}
                  onDelete={() => onDeleteClient(client.id)}
                  onFreeze={handleFreezeUpdate}
                  sipReminders={sipReminders.filter(r => r.clientId === client.id)}
                  investments={investments.filter(i => i.clientId === client.id)}
                  onNavigateToSIP={() => setActiveTab('sip')}
                  onNavigateToInvestments={() => setActiveTab('investment-tracker')}
                />
              ))
            )}
          </div>
        ) : (
          /* ── List View ── */
          <div className={`border rounded-lg overflow-hidden ${
            neon ? 'border-cyan-500/20' : ''
          }`}>
            <div className={`grid grid-cols-12 gap-4 px-4 py-3 font-semibold border-b ${
              neon
                ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-300'
                : highlightBg
            }`}>
              <div className="col-span-3 flex items-center">Client</div>
              <div className="col-span-2 flex items-center">Products</div>
              <div className="col-span-2 flex items-center">Investment</div>
              <div className="col-span-2 flex items-center">Created</div>
              <div className="col-span-3 flex items-center justify-end">Actions</div>
            </div>
            
            {filteredClients.length === 0 ? (
              <div className={`text-center py-8 ${
                neon ? 'text-cyan-400/60' : 'text-gray-500'
              }`}>
                {activeClientTab === 'frozen' 
                  ? 'No frozen clients found.'
                  : 'No clients found. Try adjusting your search.'}
              </div>
            ) : (
              <div className={`divide-y ${
                neon ? 'divide-cyan-500/10' : 'divide-y'
              }`}>
                {filteredClients.map(client => {
                  const { totalInvestment, sipAmount, hasSIP } = getClientInvestmentData(client.id);
                  const { isBirthdayThisMonth, isAnniversaryThisMonth } = getClientDateStatus(client);
                  const isFrozen = client.isFrozen || false;
                  
                  return (
                    <div 
                      key={client.id} 
                      className={`grid grid-cols-12 gap-4 px-4 py-3 transition-colors ${
                        neon
                          ? isFrozen
                            ? 'bg-slate-800/50 opacity-70 hover:bg-cyan-500/5'
                            : 'hover:bg-cyan-500/5'
                          : isFrozen
                            ? 'bg-slate-50 opacity-70'
                            : `hover:${highlightBg}`
                      }`}
                    >
                      {/* Client Info */}
                      <div className="col-span-3 flex items-center">
                        <div className="relative">
                          <Avatar className={`h-10 w-10 mr-3 ${isFrozen ? 'grayscale' : ''}`}>
                            <AvatarFallback className={`${
                              isFrozen
                                ? neon ? 'bg-slate-600' : 'bg-gray-400'
                                : neon
                                  ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 shadow-[0_0_8px_rgba(0,255,255,0.2)]'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            } text-white font-bold`}>
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 flex">
                            {isFrozen && (
                              <div className={`rounded-full p-0.5 ${
                                neon ? 'bg-slate-500' : 'bg-slate-500'
                              }`} title="Frozen">
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
                        <div>
                          <div className={`font-medium flex items-center ${
                            neon ? 'text-slate-200' : ''
                          }`}>
                            {client.name}
                            {isFrozen && (
                              <Badge className={`ml-2 text-xs ${
                                neon ? 'bg-slate-700 text-slate-400 border border-slate-600' : 'bg-slate-200 text-slate-600'
                              }`}>
                                Frozen
                              </Badge>
                            )}
                            {client.riskProfile && !isFrozen && (
                              <Badge className={`ml-2 text-xs px-1.5 py-0.5 ${
                                client.riskProfile === 'conservative'
                                  ? neon ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-800'
                                  : client.riskProfile === 'moderate'
                                  ? neon ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-800'
                                  : neon ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {client.riskProfile.charAt(0)}
                              </Badge>
                            )}
                          </div>
                          <div className={`text-sm flex items-center mt-1 ${
                            neon ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            <Mail className={`h-3 w-3 mr-1 ${neon ? 'text-cyan-400/60' : ''}`} />
                            {client.email || 'No email'}
                          </div>
                          {client.phone && (
                            <div className={`text-sm flex items-center mt-1 ${
                              neon ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                              <Phone className={`h-3 w-3 mr-1 ${neon ? 'text-cyan-400/60' : ''}`} />
                              {client.phone}
                            </div>
                          )}
                          {client.can && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`text-xs font-medium ${
                                neon ? 'text-slate-500' : 'text-gray-500'
                              }`}>CAN:</span>
                              <div className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${
                                neon ? 'bg-cyan-500/5 border border-cyan-500/20' : 'bg-gray-100'
                              }`}>
                                <span className={`font-mono text-xs ${
                                  neon ? 'text-cyan-300' : ''
                                }`}>{client.can}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className={`h-5 w-5 p-0 ${
                                    neon ? 'text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300' : 'text-gray-600 hover:bg-gray-200'
                                  }`}
                                  onClick={() => handleCopyCAN(client.can!)}
                                >
                                  <Copy className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {isFrozen && client.freezeReason && (
                            <div className={`mt-1 p-1 rounded text-xs italic ${
                              neon
                                ? 'bg-cyan-500/5 border border-cyan-500/10 text-slate-400'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <span className="font-medium">Reason:</span> {client.freezeReason}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Products */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex flex-wrap gap-1">
                          {getProductBadges(client).slice(0, 2).map((product, index) => (
                            <Badge key={index} variant="secondary" className={`text-xs ${
                              isFrozen
                                ? neon ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'
                                : neon ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' : ''
                            }`}>
                              {product}
                            </Badge>
                          ))}
                          {getProductBadges(client).length > 2 && (
                            <Badge variant="secondary" className={`text-xs ${
                              isFrozen
                                ? neon ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'
                                : neon ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' : ''
                            }`}>
                              +{getProductBadges(client).length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Investment */}
                      <div className="col-span-2 flex items-center">
                        <div>
                          {hasSIP && !isFrozen && (
                            <div className={`text-sm ${
                              neon ? 'text-slate-300' : ''
                            }`}>
                              <span className={neon ? 'text-slate-400' : 'text-gray-500'}>SIP: </span>
                              <span className="font-medium">{formatCurrency(sipAmount)}</span>
                            </div>
                          )}
                          <div className={`text-sm ${
                            neon ? 'text-slate-300' : ''
                          }`}>
                            <span className={neon ? 'text-slate-400' : 'text-gray-500'}>Total: </span>
                            <span className="font-medium">{formatCurrency(totalInvestment)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Created Date */}
                      <div className="col-span-2 flex items-center">
                        <div className={`flex items-center text-sm ${
                          neon ? 'text-slate-400' : ''
                        }`}>
                          <Calendar className={`h-4 w-4 mr-2 ${
                            neon ? 'text-cyan-400/60' : 'text-gray-500'
                          }`} />
                          {formatDate(client.createdAt)}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-3 flex items-center justify-end gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingClient(client)}
                          title="Edit Client"
                          className={`h-8 px-2 rounded-lg transition-all duration-200 ${
                            neon
                              ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300'
                              : ''
                          }`}
                          disabled={isFrozen}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setActiveTab("email");
                            setEmailComponentProps({
                              defaultRecipient: client.email,
                              openCompose: true
                            });
                          }}
                          title="Send Email"
                          className={`h-8 px-2 rounded-lg transition-all duration-200 ${
                            neon
                              ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300'
                              : ''
                          }`}
                          disabled={isFrozen}
                        >
                          <MailIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.open(
                              `https://api.whatsapp.com/send/?phone=91${client.phone}&text=${encodeURIComponent(
                                `Hi ${client.name}, this is from Dhanam Financial Services. Let's connect!`
                              )}&type=phone_number&app_absent=0`,
                              '_blank'
                            );
                          }}
                          title="Send WhatsApp Message"
                          className={`h-8 px-2 rounded-lg transition-all duration-200 ${
                            neon
                              ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300'
                              : ''
                          }`}
                          disabled={isFrozen}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('sip')}
                          title="View SIP Details"
                          className={`h-8 px-2 rounded-lg transition-all duration-200 ${
                            neon
                              ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300'
                              : ''
                          }`}
                          disabled={isFrozen}
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDeleteClient(client.id)}
                          className={`h-8 px-2 rounded-lg transition-all duration-200 ${
                            neon
                              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_10px_rgba(255,0,0,0.1)]'
                              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title="Delete Client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {editingClient && (
          <EditClientModal
            client={editingClient}
            onSave={async (updatedClient) => {
              try {
                const success = await updateClient(updatedClient.id, updatedClient);
                if (success) {
                  setEditingClient(null);
                  showAlert('Client updated successfully');
                }
              } catch (error) {
                console.error('Error updating client:', error);
                showAlert('Error updating client');
              }
            }}
            onCancel={() => setEditingClient(null)}
            theme={theme}
          />
        )}

        {/* ── Delete Confirmation Dialog ── */}
        
      </CardContent>
    </Card>
  );
}