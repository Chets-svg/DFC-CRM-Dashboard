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
  Snowflake
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { EditClientModal } from "@/components/EditClientModal";
import { ClientCard } from './ClientCard';
import { ThemeName, themes, getButtonClasses, isNeon } from '@/lib/theme';
import { Client } from '@/types/client';
import { SIPReminder } from './sip-reminder';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ClientSortField = 'createdAt' | 'name' | 'products';
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
  userId
}: ClientsTabProps) {
  const [activeClientTab, setActiveClientTab] = useState<ClientTab>('mutual-funds');
  const [loading, setLoading] = useState(true);
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const neon = isNeon(theme);
  const { cardBg, borderColor, inputBg, textColor, highlightBg, mutedText } = currentTheme;

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!userId) return;
      try {
        const docRef = doc(db, 'userPreferences', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Other preferences can be loaded here if needed
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserPreferences();
  }, [userId]);

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

  const handleFreezeUpdate = () => {
    // onSnapshot handles the refresh automatically
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
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-8 rounded-full ${
                  neon
                    ? 'bg-slate-900 border-cyan-500/30 text-slate-300 placeholder:text-cyan-600/50 focus:border-cyan-400 focus:ring-cyan-500/20'
                    : `${inputBg} ${borderColor}`
                }`}
              />
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                neon ? 'text-cyan-400/60' : 'text-muted-foreground'
              }`} />
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
        {/* ── Grid View Only ── */}
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
      </CardContent>
    </Card>
  );
}