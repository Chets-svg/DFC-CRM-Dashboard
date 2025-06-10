import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from "/components/ui/card"
import { Button } from "/components/ui/button"
import { 
  Sun, 
  Moon, 
  Users, 
  Shield, 
  Mail, 
  User, 
  Plus, 
  Edit, 
  Check, 
  X,
  Activity,
  BarChart2,
  TrendingUp,
  PieChart
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts"

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  productInterest: string
  status: 'new' | 'contacted' | 'qualified' | 'lost'
  notes: string[]
}

type KYC = {
  id: string
  leadId: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  completedDate?: string
}

type Client = {
  id: string
  name: string
  email: string
  phone: string
  products: {
    mutualFund?: boolean
    sip?: boolean
    lumpsum?: boolean
    healthInsurance?: boolean
    lifeInsurance?: boolean
  }
}

type Communication = {
  id: string
  clientId: string
  type: 'email' | 'whatsapp'
  date: string
  content: string
}

export default function CRMDashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [activeTab, setActiveTab] = useState('dashboard') // Default to dashboard
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      productInterest: 'Mutual Funds',
      status: 'new',
      notes: ['Interested in index funds']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      productInterest: 'Health Insurance',
      status: 'contacted',
      notes: ['Follow up next week']
    }
  ])
  const [kycs, setKycs] = useState<KYC[]>([
    {
      id: '1',
      leadId: '1',
      status: 'pending'
    },
    {
      id: '2',
      leadId: '2',
      status: 'completed',
      completedDate: '2023-06-15'
    }
  ])
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Robert Johnson',
      email: 'robert@example.com',
      phone: '1122334455',
      products: {
        mutualFund: true,
        sip: true,
        healthInsurance: true
      }
    }
  ])
  const [communications, setCommunications] = useState<Communication[]>([
    {
      id: '1',
      clientId: '1',
      type: 'email',
      date: '2023-06-10',
      content: 'Sent mutual fund documents'
    }
  ])
  const [newLead, setNewLead] = useState<Omit<Lead, 'id' | 'status' | 'notes'>>({ 
    name: '', 
    email: '', 
    phone: '', 
    productInterest: '' 
  })
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [newNote, setNewNote] = useState('')

  // Dashboard metrics
  const activeLeads = leads.filter(lead => lead.status !== 'lost').length
  const convertedClients = clients.length
  const pendingKYC = kycs.filter(kyc => kyc.status === 'pending').length
  const conversionRate = leads.length > 0 
    ? Math.round((convertedClients / (convertedClients + leads.length)) * 100) 
    : 0

  // Chart data
  const leadsVsClientsData = [
    { name: 'Leads', value: leads.length },
    { name: 'Clients', value: clients.length }
  ]

  const leadStatusData = [
    { name: 'New', value: leads.filter(l => l.status === 'new').length },
    { name: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
    { name: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
    { name: 'Lost', value: leads.filter(l => l.status === 'lost').length }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  // Theme styling
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const cardBg = theme === 'dark' ? 'bg-gray-700' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
  const inputBg = theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white'
  const mutedText = theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
  const highlightBg = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
  const selectedBg = theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const addLead = () => {
    const lead: Lead = {
      ...newLead,
      id: (leads.length + 1).toString(),
      status: 'new',
      notes: []
    }
    setLeads([...leads, lead])
    setNewLead({ name: '', email: '', phone: '', productInterest: '' })
  }

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, status } : lead
    ))
  }

  const addNoteToLead = (leadId: string) => {
    if (!newNote.trim()) return
    
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, notes: [...lead.notes, newNote] } 
        : lead
    ))
    setNewNote('')
  }

  const performKYC = (leadId: string) => {
    setKycs(kycs.map(kyc => 
      kyc.leadId === leadId 
        ? { ...kyc, status: 'in-progress' } 
        : kyc
    ))
    // Simulate KYC completion after 2 seconds
    setTimeout(() => {
      setKycs(kycs.map(kyc => 
        kyc.leadId === leadId 
          ? { ...kyc, status: 'completed', completedDate: new Date().toISOString().split('T')[0] } 
          : kyc
      ))
    }, 2000)
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <Button variant="outline" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <TabsTrigger value="dashboard" className={theme === 'dark' ? 'data-[state=active]:bg-gray-600' : ''}>
              <Activity className="mr-2 h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className={theme === 'dark' ? 'data-[state=active]:bg-gray-600' : ''}>
              <Users className="mr-2 h-4 w-4" /> Leads
            </TabsTrigger>
            <TabsTrigger value="kyc" className={theme === 'dark' ? 'data-[state=active]:bg-gray-600' : ''}>
              <Shield className="mr-2 h-4 w-4" /> KYC
            </TabsTrigger>
            <TabsTrigger value="clients" className={theme === 'dark' ? 'data-[state=active]:bg-gray-600' : ''}>
              <User className="mr-2 h-4 w-4" /> Clients
            </TabsTrigger>
            <TabsTrigger value="communication" className={theme === 'dark' ? 'data-[state=active]:bg-gray-600' : ''}>
              <Mail className="mr-2 h-4 w-4" /> Communication
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab - Added before Leads */}
          <TabsContent value="dashboard">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeLeads}</div>
                  <p className={`text-xs ${mutedText}`}>Currently being worked on</p>
                </CardContent>
              </Card>

              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Converted Clients</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{convertedClients}</div>
                  <p className={`text-xs ${mutedText}`}>Total successful conversions</p>
                </CardContent>
              </Card>

              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingKYC}</div>
                  <p className={`text-xs ${mutedText}`}>Requires verification</p>
                </CardContent>
              </Card>

              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{conversionRate}%</div>
                  <p className={`text-xs ${mutedText}`}>Leads to clients ratio</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader>
                  <CardTitle>Leads vs Clients</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadsVsClientsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader>
                  <CardTitle>Lead Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={leadStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {leadStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader>
                  <CardTitle>Add New Lead</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1">Name</label>
                      <input
                        type="text"
                        value={newLead.name}
                        onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                        className={`w-full p-2 border rounded ${inputBg} ${borderColor}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Email</label>
                      <input
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                        className={`w-full p-2 border rounded ${inputBg} ${borderColor}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                        className={`w-full p-2 border rounded ${inputBg} ${borderColor}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Product Interest</label>
                      <select
                        value={newLead.productInterest}
                        onChange={(e) => setNewLead({...newLead, productInterest: e.target.value})}
                        className={`w-full p-2 border rounded ${inputBg} ${borderColor}`}
                      >
                        <option value="">Select product</option>
                        <option value="Mutual Funds">Mutual Funds</option>
                        <option value="Health Insurance">Health Insurance</option>
                        <option value="Life Insurance">Life Insurance</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={addLead} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Lead
                  </Button>
                </CardFooter>
              </Card>

              <div className="md:col-span-2 space-y-4">
                <Card className={`${cardBg} ${borderColor}`}>
                  <CardHeader>
                    <CardTitle>Lead List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leads.map(lead => (
                        <div 
                          key={lead.id} 
                          className={`p-4 border rounded cursor-pointer ${selectedLead?.id === lead.id ? selectedBg : highlightBg} ${borderColor}`}
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{lead.name}</h3>
                              <p>{lead.productInterest}</p>
                              <p className={`text-sm ${mutedText}`}>{lead.email} | {lead.phone}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                              lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedLead && (
                  <Card className={`${cardBg} ${borderColor}`}>
                    <CardHeader>
                      <CardTitle>Lead Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{selectedLead.name}</h3>
                            <p>{selectedLead.productInterest}</p>
                            <p>{selectedLead.email} | {selectedLead.phone}</p>
                          </div>
                          <div className="space-x-2">
                            <Button 
                              variant={selectedLead.status === 'contacted' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateLeadStatus(selectedLead.id, 'contacted')}
                            >
                              Contacted
                            </Button>
                            <Button 
                              variant={selectedLead.status === 'qualified' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateLeadStatus(selectedLead.id, 'qualified')}
                            >
                              Qualified
                            </Button>
                            <Button 
                              variant={selectedLead.status === 'lost' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateLeadStatus(selectedLead.id, 'lost')}
                            >
                              Lost
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold mb-2">Notes</h4>
                          <div className="space-y-2 mb-4">
                            {selectedLead.notes.map((note, index) => (
                              <div key={index} className={`p-2 rounded ${highlightBg}`}>
                                {note}
                              </div>
                            ))}
                          </div>
                          <div className="flex">
                            <input
                              type="text"
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Add a note..."
                              className={`flex-1 p-2 border rounded-l ${inputBg} ${borderColor}`}
                            />
                            <Button 
                              onClick={() => addNoteToLead(selectedLead.id)}
                              className="rounded-l-none"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader>
                  <CardTitle>KYC Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {kycs.map(kyc => {
                      const lead = leads.find(l => l.id === kyc.leadId)
                      return (
                        <div key={kyc.id} className={`p-4 border rounded ${highlightBg} ${borderColor}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{lead?.name}</h3>
                              <p className={`text-sm ${mutedText}`}>{lead?.email}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                kyc.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                kyc.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                kyc.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {kyc.status}
                              </span>
                              {kyc.completedDate && (
                                <p className={`text-xs mt-1 ${mutedText}`}>Completed: {kyc.completedDate}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => performKYC(kyc.leadId)}
                              disabled={kyc.status === 'in-progress' || kyc.status === 'completed'}
                            >
                              {kyc.status === 'pending' ? 'Start KYC' : 
                               kyc.status === 'in-progress' ? 'KYC in progress...' : 'KYC Completed'}
                            </Button>
                          </div>
                        </div>
                      )
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
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card className={`${cardBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients.map(client => (
                    <div key={client.id} className={`p-4 border rounded ${highlightBg} ${borderColor}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{client.name}</h3>
                          <p className={`text-sm ${mutedText}`}>{client.email} | {client.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-bold mb-2">Products</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div className={`p-2 rounded text-center ${client.products.mutualFund ? 'bg-green-100' : highlightBg}`}>
                            <div className="font-medium">Mutual Fund</div>
                            {client.products.mutualFund ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className={`p-2 rounded text-center ${client.products.sip ? 'bg-green-100' : highlightBg}`}>
                            <div className="font-medium">SIP</div>
                            {client.products.sip ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className={`p-2 rounded text-center ${client.products.lumpsum ? 'bg-green-100' : highlightBg}`}>
                            <div className="font-medium">Lumpsum</div>
                            {client.products.lumpsum ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className={`p-2 rounded text-center ${client.products.healthInsurance ? 'bg-green-100' : highlightBg}`}>
                            <div className="font-medium">Health Ins.</div>
                            {client.products.healthInsurance ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className={`p-2 rounded text-center ${client.products.lifeInsurance ? 'bg-green-100' : highlightBg}`}>
                            <div className="font-medium">Life Ins.</div>
                            {client.products.lifeInsurance ? (
                              <Check className="mx-auto h-4 w-4 text-green-500" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add New Client
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <Card className={`${cardBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle>Client Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communications.map(comm => {
                    const client = clients.find(c => c.id === comm.clientId)
                    return (
                      <div key={comm.id} className={`p-4 border rounded ${highlightBg} ${borderColor}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold">{client?.name}</h3>
                            <p className={`text-sm ${mutedText}`}>{comm.date} | {comm.type}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            comm.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {comm.type}
                          </span>
                        </div>
                        <div className={`mt-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`}>
                          {comm.content}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" /> Send Email
                </Button>
                <Button variant="outline">
                  Send WhatsApp
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
