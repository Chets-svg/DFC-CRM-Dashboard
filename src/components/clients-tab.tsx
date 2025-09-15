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
  Copy
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ClientDetailsModal } from './ClientDetailsModal';
import { EditClientModal } from "@/components/EditClientModal";
import { ClientCard } from './ClientCard';
import { ThemeName, themes, getButtonClasses } from '@/lib/theme';
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
import { Label } from "@/components/ui/label";
import { toast } from 'react-hot-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ClientSortField = 'createdAt' | 'name' | 'products';
type ViewMode = 'grid' | 'list';

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
  userId: string; // Add userId prop
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
  userId // Destructure userId
}: ClientsTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{clientId: string | null, clientName: string}>({clientId: null, clientName: ''});
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, inputBg, textColor, highlightBg } = currentTheme;

  // Load user preferences on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!userId) return;
      
      try {
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
    if (client.products.mutualFund || client.products.sutalFund || client.products.lumpsum) {
      return 'mutualFund';
    }
    if (client.products.healthInsurance) return 'healthInsurance';
    if (client.products.lifeInsurance) return 'lifeInsurance';
    if (client.products.taxation) return 'taxation';
    if (client.products.nps) return 'nps';
    return 'mutualFund';
  };

  const filteredClients = [...clients].filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.can?.includes(searchTerm)
  ).sort((a, b) => {
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

  const handleDeleteClick = (clientId: string, clientName: string) => {
    setDeleteConfirmation({ clientId, clientName });
    setDeletePassword('');
    setDeleteError('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletePassword === 'Rosh@1309') {
      if (deleteConfirmation.clientId) {
        onDeleteClient(deleteConfirmation.clientId);
        setIsDeleteDialogOpen(false);
        setDeleteConfirmation({ clientId: null, clientName: '' });
        setDeletePassword('');
        setDeleteError('');
        showAlert('Client deleted successfully');
      }
    } else {
      setDeleteError('Incorrect password');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDeleteConfirm();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className={`${cardBg} ${borderColor}`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Client Management</CardTitle>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => updateViewMode('grid')}
                className={viewMode === 'grid' ? getButtonClasses(theme) : ''}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => updateViewMode('list')}
                className={viewMode === 'list' ? getButtonClasses(theme) : ''}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={() => setActiveTab("leads")}
              className={getButtonClasses(theme)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
            
            <div className="flex items-center gap-2">
              <Select
                value={clientSortField}
                onValueChange={(value) => setClientSortField(value as ClientSortField)}
              >
                <SelectTrigger className={`w-[180px] ${inputBg} ${borderColor}`}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className={`${cardBg} ${borderColor}`}>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="products">Primary Product</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClientSortDirection(clientSortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-2"
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
      </CardHeader>
      
      <CardContent>
        {viewMode === 'grid' ? (
          // Grid View (existing card view)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map(client => (
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
                  // You can implement view details functionality here if needed
                  console.log("View details for:", client.name);
                }}
                onDelete={() => handleDeleteClick(client.id, client.name || '')}
                sipReminders={sipReminders.filter(r => r.clientId === client.id)}
                investments={investments.filter(i => i.clientId === client.id)}
                onNavigateToSIP={() => setActiveTab('sip')}
                onNavigateToInvestments={() => setActiveTab('investment-tracker')}
              />
            ))}
          </div>
        ) : (
          // List View
          <div className="border rounded-md overflow-hidden">
            <div className={`grid grid-cols-12 gap-4 px-4 py-3 font-semibold border-b ${currentTheme.highlightBg}`}>
              <div className="col-span-3 flex items-center">Client</div>
              <div className="col-span-2 flex items-center">Products</div>
              <div className="col-span-2 flex items-center">Investment</div>
              <div className="col-span-2 flex items-center">Created</div>
              <div className="col-span-3 flex items-center justify-end">Actions</div>
            </div>
            
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No clients found. Try adjusting your search.
              </div>
            ) : (
              <div className="divide-y">
                {filteredClients.map(client => {
                  const { totalInvestment, sipAmount, hasSIP } = getClientInvestmentData(client.id);
                  const { isBirthdayThisMonth, isAnniversaryThisMonth } = getClientDateStatus(client);
                  
                  return (
                    <div 
                      key={client.id} 
                      className={`grid grid-cols-12 gap-4 px-4 py-3 hover:${currentTheme.highlightBg} transition-colors`}
                    >
                      {/* Client Info */}
                      <div className="col-span-3 flex items-center">
                        <div className="relative">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                              {getInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 flex">
                            {isBirthdayThisMonth && (
                              <div className="bg-pink-500 rounded-full p-0.5">
                                <CalendarDays className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                            {isAnniversaryThisMonth && (
                              <div className="bg-purple-500 rounded-full p-0.5">
                                <Heart className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            {client.name}
                            {client.riskProfile && (
                              <Badge className={`
                                ml-2 text-xs px-1.5 py-0.5
                                ${client.riskProfile === 'conservative' ? 'bg-blue-100 text-blue-800' : 
                                  client.riskProfile === 'moderate' ? 'bg-green-100 text-green-800' : 
                                  'bg-amber-100 text-amber-800'}
                              `}>
                                {client.riskProfile.charAt(0)}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email || 'No email'}
                          </div>
                          {client.phone && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {client.phone}
                            </div>
                          )}
                          {client.can && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs font-medium text-gray-500">CAN:</span>
                              <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                                <span className="font-mono text-xs">{client.can}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-5 w-5 p-0 text-gray-600 hover:bg-gray-200"
                                  onClick={() => handleCopyCAN(client.can!)}
                                >
                                  <Copy className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Products */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex flex-wrap gap-1">
                          {getProductBadges(client).slice(0, 2).map((product, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                          {getProductBadges(client).length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{getProductBadges(client).length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Investment */}
                      <div className="col-span-2 flex items-center">
                        <div>
                          {hasSIP && (
                            <div className="text-sm">
                              <span className="text-gray-500">SIP: </span>
                              <span className="font-medium">{formatCurrency(sipAmount)}</span>
                            </div>
                          )}
                          <div className="text-sm">
                            <span className="text-gray-500">Total: </span>
                            <span className="font-medium">{formatCurrency(totalInvestment)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Created Date */}
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
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
                          className="h-8 px-2"
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
                          className="h-8 px-2"
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
                          className="h-8 px-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('sip')}
                          title="View SIP Details"
                          className="h-8 px-2"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteClick(client.id, client.name || '')}
                          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
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

        {/* Delete Confirmation Dialog - Matching your grid view exactly */}
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
                  <Label htmlFor="delete-password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="mt-1"
                    placeholder="Enter password to confirm"
                    onKeyDown={handleKeyDown}
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
      </CardContent>
    </Card>
  );
}