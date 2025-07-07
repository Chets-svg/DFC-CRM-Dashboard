import { Mail, Phone, Calendar, Edit, MessageSquare, User } from "lucide-react";
import { Button } from "/components/ui/button";
import { Badge } from "/components/ui/badge";
import { Avatar, AvatarFallback } from "/components/ui/avatar";

interface ClientCardsRowProps {
  clients: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    dateCreated?: string;
    createdAt?: string;
    products?: {
      mutualFund?: boolean;
      sip?: boolean;
      lumpsum?: boolean;
      healthInsurance?: boolean;
      lifeInsurance?: boolean;
      taxation?: boolean;
      nps?: boolean;
    };
    status?: string;
    lastContact?: string;
  }[];
  onEditClient: (client: any) => void;
  onEmailClient: (email: string) => void;
  onWhatsAppClient: (phone: string, name: string) => void;
  onViewDetails: (clientId: string) => void;
  theme: string;
}

export function ClientCardsRow({ 
  clients, 
  onEditClient, 
  onEmailClient, 
  onWhatsAppClient, 
  onViewDetails,
  theme 
}: ClientCardsRowProps) {
    const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getProductBadges = (products: ClientCardsRowProps['clients'][0]['products']) => {
    if (!products) return [];
    return Object.entries(products)
      .filter(([_, value]) => value)
      .map(([key]) => {
        switch(key) {
          case 'mutualFund': return 'Mutual Funds';
          case 'healthInsurance': return 'Health Insurance';
          case 'lifeInsurance': return 'Life Insurance';
          case 'taxation': return 'Taxation';
          case 'nps': return 'NPS';
          case 'sip': return 'SIP';
          case 'lumpsum': return 'Lumpsum';
          default: return key;
        }
      });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center flex-wrap">
      {clients.map(client => (
        <div 
          key={client.id} 
          className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-lg bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden border border-gray-100"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-white">Client Profile</h2>
                <p className="text-sm text-blue-100">Added on {formatDate(client.dateCreated || client.createdAt)}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                {client.status || 'Active'}
              </Badge>
            </div>
          </div>
          
          {/* Client Info */}
          <div className="p-6">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"></div>
                <Avatar className="h-16 w-16 relative border-2 border-blue-500">
                  <AvatarFallback className="bg-transparent text-white text-2xl font-bold">
                    {getInitials(client.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{client.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <Mail className="w-4 h-4 text-blue-500" />
                      {client.email || 'No email provided'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600"
                      onClick={() => onEditClient(client)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-700 bg-blue-50 px-3 py-1.5 rounded-full">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{client.phone || 'No phone provided'}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600"
                      onClick={() => client.email && onEmailClient(client.email)}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 border-green-200 bg-green-50 hover:bg-green-100 text-green-600"
                      onClick={() => client.phone && onWhatsAppClient(client.phone, client.name)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>

                {client.lastContact && (
                  <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last contact: {formatDate(client.lastContact)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Products */}
            <div className="mt-8">
              <h4 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Investment Portfolio
              </h4>
              <div className="flex flex-wrap gap-3">
                {getProductBadges(client.products).map((product, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="gap-1.5 px-3 py-1.5 border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-600"
                  >
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600"
              onClick={() => onViewDetails(client.id)}
            >
              View Full Details
            </Button>
            <div className="text-sm text-gray-500">
              Client ID: {getInitials(client.name)}-{(client.dateCreated || client.createdAt || '').toString().replace(/-/g, '').slice(2, 8)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

