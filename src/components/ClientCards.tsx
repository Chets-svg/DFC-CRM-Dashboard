import React, { useState, useEffect } from 'react';
import { Mail, Phone, Shield, PieChart, ArrowUp, Calendar, Edit, MessageSquare, User, Filter, Plus, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

const mockClients = [
  {
    id: 1,
    name: 'Chetan Jethithor',
    email: 'jethithor.chetan@gmail.com',
    phone: '09167673824',
    dateCreated: '2023-10-15',
    products: [
      'Life Insurance',
      'Health Insurance',
      'NPS',
      'SIP',
      'Taxation',
      'Lumpsum',
      'Mutual Fund'
    ],
    status: 'Active',
    lastContact: '2023-11-20'
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '09167788991',
    dateCreated: '2023-09-10',
    products: ['Mutual Fund', 'Taxation', 'Health Insurance'],
    status: 'Active',
    lastContact: '2023-11-15'
  }
];

export default function ClientCards() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductIcon = (product: string) => {
    switch (product) {
      case 'Life Insurance':
      case 'Health Insurance':
        return <Shield className="w-4 h-4" />;
      case 'SIP':
      case 'Lumpsum':
      case 'Mutual Fund':
        return <PieChart className="w-4 h-4" />;
      case 'NPS':
      case 'Taxation':
        return <ArrowUp className="w-4 h-4" />;
      default:
        return <PieChart className="w-4 h-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Client Relationship Manager</h1>
          <p className="text-muted-foreground">
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search clients."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filters <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">Client Profile</h2>
                  <p className="text-sm text-blue-100">Added on {formatDate(client.dateCreated)}</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                  {client.status}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"></div>
                  <Avatar className="h-12 w-12 relative border-2 border-blue-500">
                    <AvatarFallback className="bg-transparent text-white text-2xl font-bold">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{client.name}</h3>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Mail className="w-4 h-4 text-blue-500" />
                        {client.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600">
                        <Edit className="w-4 h-4" /> Edit
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-700 bg-blue-50 px-3 py-1.5 rounded-full">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{client.phone}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600">
                        <Mail className="w-4 h-4" /> Email
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 border-green-200 bg-green-50 hover:bg-green-100 text-green-600">
                        <MessageSquare className="w-4 h-4" /> WhatsApp
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last contact: {formatDate(client.lastContact)}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" /> Investment Portfolio
                </h4>
                <div className="flex flex-wrap gap-3">
                  {client.products.map((product, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="gap-1.5 px-3 py-1.5 border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-600"
                    >
                      {getProductIcon(product)} {product}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center">
              <Button variant="ghost" size="sm" className="text-gray-600">
                View Full Details
              </Button>
              <div className="text-sm text-gray-500">
                Client ID: {getInitials(client.name)}-{client.dateCreated.replace(/-/g, '').slice(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
