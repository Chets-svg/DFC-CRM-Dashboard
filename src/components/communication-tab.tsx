"use client";

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Calendar, 
  Mail, 
  Check, 
  Pause, 
  Play 
} from "lucide-react";
import { 
  addDocument, 
  COMMUNICATIONS_COLLECTION 
} from "@/lib/firebase-config";
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from "recharts";
import { ThemeName, themes, getButtonClasses } from '@/lib/theme';

type CommunicationType = 'email' | 'whatsapp' | 'call' | 'meeting' | 'document';
type CommunicationPriority = 'low' | 'medium' | 'high';
type CommunicationStatus = 'pending' | 'sent' | 'received' | 'read' | 'failed';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  // Add other client properties as needed
}

interface EnhancedCommunication {
  id: string;
  clientId: string;
  clientName: string;
  type: CommunicationType;
  date: string;
  subject: string;
  content: string;
  priority: CommunicationPriority;
  status: CommunicationStatus;
  followUpDate?: string;
  relatedProduct?: string;
  advisorNotes?: string;
}

interface CommunicationTabProps {
  theme: ThemeName;
  clients: Client[];
  communications: EnhancedCommunication[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  showAlert: (message: string) => void;
}

export default function CommunicationTab({
  theme,
  clients,
  communications,
  selectedClientId,
  setSelectedClientId,
  showAlert
}: CommunicationTabProps) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, inputBg, highlightBg, textColor, mutedText } = currentTheme;

  const [newCommunication, setNewCommunication] = useState<{
    type: CommunicationType;
    subject: string;
    content: string;
    priority: CommunicationPriority;
    followUpDate: string;
    relatedProduct: string;
  }>({
    type: 'email',
    subject: '',
    content: '',
    priority: 'medium',
    followUpDate: '',
    relatedProduct: ''
  });

  const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date());
  const [meetingNotes, setMeetingNotes] = useState('');

  const getPriorityColor = (priority: CommunicationPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: CommunicationStatus) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-indigo-100 text-indigo-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateCommunication = async () => {
    if (!selectedClientId) {
      showAlert('Please select a client');
      return;
    }
    if (!newCommunication.subject || !newCommunication.content) {
      showAlert('Please fill in subject and content');
      return;
    }
    try {
      const client = clients.find(c => c.id === selectedClientId);
      if (!client) {
        showAlert('Client not found');
        return;
      }

      // Create the communication document
      await addDocument(COMMUNICATIONS_COLLECTION, {
        clientId: selectedClientId,
        clientName: client.name,
        date: new Date().toISOString(),
        status: 'pending',
        ...newCommunication
      });

      // Reset form
      setNewCommunication({
        type: 'email',
        subject: '',
        content: '',
        priority: 'medium',
        followUpDate: '',
        relatedProduct: ''
      });

      showAlert('Communication created successfully');
    } catch (error) {
      console.error('Error creating communication:', error);
      showAlert('Error creating communication');
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedClientId) {
      showAlert('Please select a client first');
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    try {
      // Create the meeting communication document
      await addDocument(COMMUNICATIONS_COLLECTION, {
        clientId: selectedClientId,
        clientName: client.name,
        type: 'meeting',
        date: meetingDate?.toISOString() || new Date().toISOString(),
        subject: 'Scheduled Meeting',
        content: meetingNotes,
        priority: 'medium',
        status: 'pending',
        followUpDate: '',
        relatedProduct: '',
        advisorNotes: 'Meeting scheduled via dashboard'
      });

      setMeetingNotes('');
      showAlert(`Meeting scheduled with ${client.name}`);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      showAlert('Error scheduling meeting');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Communication History */}
      <Card className={`${cardBg} ${borderColor} lg:col-span-2`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Client Communication History</CardTitle>
            <Select
              value={selectedClientId || undefined}
              onValueChange={(value) => setSelectedClientId(value || null)}
            >
              <SelectTrigger className={`w-[200px] ${inputBg} ${borderColor}`}>
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent className={`${cardBg} ${borderColor}`}>
                {clients?.map(client => (
                  <SelectItem 
                    key={client.id} 
                    value={client.id}
                    className={`hover:${highlightBg} ${textColor}`}
                  >
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {communications
              .filter(comm => !selectedClientId || comm.clientId === selectedClientId)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(comm => {
                const client = clients.find(c => c.id === comm.clientId);
                return (
                  <div key={comm.id} className={`p-4 border rounded-lg ${highlightBg} ${borderColor}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{comm.subject}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(comm.priority)}`}>
                            {comm.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(comm.status)}`}>
                            {comm.status}
                          </span>
                        </div>
                        <p className={`text-sm ${mutedText}`}>
                          {client?.name} • {formatDate(comm.date)} • {comm.type}
                        </p>
                      </div>
                      {comm.relatedProduct && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {comm.relatedProduct}
                        </span>
                      )}
                    </div>
                    
                    <div className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <p>{comm.content}</p>
                    </div>

                    {(comm.followUpDate || comm.advisorNotes) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {comm.followUpDate && (
                          <p className="text-sm">
                            <span className="font-medium">Follow-up:</span> {formatDate(comm.followUpDate)}
                          </p>
                        )}
                        {comm.advisorNotes && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Advisor Notes:</p>
                            <p className={`text-sm ${mutedText}`}>{comm.advisorNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Meeting Section */}
      <div>      
        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader>
            <CardTitle>Schedule Meeting</CardTitle>
          </CardHeader>
        
          <CardContent className="pt-1">
            <div className="space-y-5">
              <div>
                <Label className="block mb-2">Client</Label>
                <Select
                  value={selectedClientId || undefined}
                  onValueChange={(value) => setSelectedClientId(value || null)}
                >
                  <SelectTrigger className={`w-full ${inputBg} ${borderColor}`}>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent className={`${cardBg} ${borderColor}`}>
                    {clients?.map(client => (
                      <SelectItem 
                        key={client.id} 
                        value={client.id}
                        className={`hover:${highlightBg} ${textColor}`}
                      >
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date & Time</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <Input
                    type="datetime-local"
                    value={meetingDate?.toISOString().slice(0, 16)}
                    onChange={(e) => setMeetingDate(new Date(e.target.value))}
                    className={`${inputBg} ${borderColor}`}
                  />
                </div>
              </div>

              <div>
                <Label className="block mb-2">Meeting Agenda</Label> 
                <Textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Meeting agenda or notes..."
                  rows={3}
                  className={`${inputBg} ${borderColor}`}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleScheduleMeeting}
                  className={getButtonClasses(theme)}
                  disabled={!selectedClientId}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Communication Panel */}
      <Card className={`${cardBg} ${borderColor} lg:col-span-2`}>
        <CardHeader>
          <CardTitle>New Communication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type Select */}
          <div>
            <Label className="block mb-2">Type *</Label>
            <Select
              value={newCommunication.type}
              onValueChange={(value) => setNewCommunication({...newCommunication, type: value as CommunicationType})}
            >
              <SelectTrigger className={`${inputBg} ${borderColor}`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className={`${cardBg} ${borderColor}`}>
                {['email', 'whatsapp', 'call', 'meeting', 'document'].map(type => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className={`hover:${highlightBg} ${textColor}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Select */}
          <div>
            <Label className="block mb-2">Priority *</Label>
            <Select
              value={newCommunication.priority}
              onValueChange={(value) => setNewCommunication({...newCommunication, priority: value as CommunicationPriority})}
            >
              <SelectTrigger className={`${inputBg} ${borderColor}`}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className={`${cardBg} ${borderColor}`}>
                {['low', 'medium', 'high'].map(priority => (
                  <SelectItem 
                    key={priority} 
                    value={priority}
                    className={`hover:${highlightBg} ${textColor}`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Related Product Select */}
          <div>
            <Label className="block mb-2">Related Product</Label>
            <Select
              value={newCommunication.relatedProduct || undefined}
              onValueChange={(value) => setNewCommunication({...newCommunication, relatedProduct: value})}
            >
              <SelectTrigger className={`${inputBg} ${borderColor}`}>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent className={`${cardBg} ${borderColor}`}>
                {[
                  'Mutual Funds - SIP',
                  'Mutual Funds - Lumpsum',
                  'Health Insurance',
                  'Life Insurance',
                  'Taxation Planning',
                  'National Pension System (NPS)'
                ].map(product => (
                  <SelectItem 
                    key={product} 
                    value={product}
                    className={`hover:${highlightBg} ${textColor}`}
                  >
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Input */}
          <div>
            <label className="block mb-1">Subject *</label>
            <Input
              value={newCommunication.subject}
              onChange={(e) => setNewCommunication({...newCommunication, subject: e.target.value})}
              placeholder="Subject"
              className={`${inputBg} ${borderColor}`}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block mb-2">Content *</label>
            <Textarea
              value={newCommunication.content}
              onChange={(e) => setNewCommunication({...newCommunication, content: e.target.value})}
              placeholder="Type your message here..."
              rows={5}
              className={`${inputBg} ${borderColor}`}
            />
          </div>

          {/* Follow-up Date Input */}
          <div>
            <label className="block mb-1">Follow-up Date</label>
            <Input
              type="date"
              value={newCommunication.followUpDate}
              onChange={(e) => setNewCommunication({...newCommunication, followUpDate: e.target.value})}
              className={`${inputBg} ${borderColor}`}
            />
          </div>

          {/* Submit Button */}
          <Button 
            className={`w-full mt-4 ${getButtonClasses(theme)}`}
            onClick={handleCreateCommunication}
            disabled={!selectedClientId || !newCommunication.subject || !newCommunication.content}
          >
            <Mail className="mr-2 h-4 w-4" /> 
            Create Communication
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}