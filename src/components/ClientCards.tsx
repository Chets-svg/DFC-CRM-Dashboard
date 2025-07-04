import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  User, 
  ChevronRight, 
  MessageSquare, 
  Calendar, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Grid,
  List
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '/components/ui'
import type { Client, ThemeName } from '@/types'

type ClientViewProps = {
  clients: Client[]
  theme: ThemeName
  editingClientId: string | null
  editedClient: Partial<Client>
  setEditedClient: (client: Partial<Client>) => void
  handleSaveEdit: () => void
  deleteClient: (id: string) => void
  setActiveTab: (tab: string) => void
  setEmailComponentProps: (props: any) => void
  clientSortField: string
  setClientSortField: (field: string) => void
}

export function ClientViews({
  clients,
  theme,
  editingClientId,
  editedClient,
  setEditedClient,
  handleSaveEdit,
  deleteClient,
  setActiveTab,
  setEmailComponentProps,
  clientSortField,
  setClientSortField
}: ClientViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  }

  return (
    <Card className={`${themes[theme].cardBg} ${themes[theme].borderColor}`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Client Management</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={() => setActiveTab("leads")}
              className={getButtonClasses(theme)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleViewMode}
              className="gap-2"
            >
              {viewMode === 'grid' ? (
                <>
                  <List size={16} /> List View
                </>
              ) : (
                <>
                  <Grid size={16} /> Grid View
                </>
              )}
            </Button>
            <Select
              value={clientSortField}
              onValueChange={(value) => setClientSortField(value)}
            >
              <SelectTrigger className={`w-[180px] ${themes[theme].inputBg} ${themes[theme].borderColor}`}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className={`${themes[theme].cardBg} ${themes[theme].borderColor}`}>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="products">Primary Product</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={() => {
                  setEditingClientId(client.id)
                  setEditedClient({ ...client })
                }}
                onDelete={() => deleteClient(client.id)}
                onEmailClick={() => {
                  setActiveTab("email")
                  setEmailComponentProps({
                    defaultRecipient: client.email,
                    openCompose: true
                  })
                }}
                onWhatsAppClick={() => {
                  console.log("WhatsApp:", client.phone)
                }}
                theme={theme}
                isEditing={editingClientId === client.id}
                editedClient={editingClientId === client.id ? editedClient : {}}
                setEditedClient={setEditedClient}
                onSaveEdit={() => {
                  handleSaveEdit()
                  setEditingClientId(null)
                }}
                onCancelEdit={() => {
                  setEditingClientId(null)
                  setEditedClient({})
                }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map(client => (
              <ClientListCard
                key={client.id}
                client={client}
                onEdit={() => {
                  setEditingClientId(client.id)
                  setEditedClient({ ...client })
                }}
                onDelete={() => deleteClient(client.id)}
                onEmailClick={() => {
                  setActiveTab("email")
                  setEmailComponentProps({
                    defaultRecipient: client.email,
                    openCompose: true
                  })
                }}
                onWhatsAppClick={() => {
                  console.log("WhatsApp:", client.phone)
                }}
                theme={theme}
                isEditing={editingClientId === client.id}
                editedClient={editingClientId === client.id ? editedClient : {}}
                setEditedClient={setEditedClient}
                onSaveEdit={() => {
                  handleSaveEdit()
                  setEditingClientId(null)
                }}
                onCancelEdit={() => {
                  setEditingClientId(null)
                  setEditedClient({})
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Client Card Component (Grid View)
const ClientCard = ({ 
  client, 
  onEdit, 
  onDelete,
  onEmailClick,
  onWhatsAppClick,
  theme,
  isEditing,
  editedClient,
  setEditedClient,
  onSaveEdit,
  onCancelEdit
}: {
  client: Client
  onEdit: () => void
  onDelete: () => void
  onEmailClick: () => void
  onWhatsAppClick: () => void
  theme: ThemeName
  isEditing: boolean
  editedClient: Partial<Client>
  setEditedClient: (client: Partial<Client>) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}) => {
  const currentTheme = themes[theme] || themes['blue-smoke']
  const [isExpanded, setIsExpanded] = useState(false)

  const getProductBadgeColor = (product: keyof Client['products']) => {
    if (!client.products[product]) return 'bg-gray-100 text-gray-600'
    
    return {
      mutualFund: 'bg-blue-100 text-blue-800',
      sip: 'bg-green-100 text-green-800',
      lumpsum: 'bg-purple-100 text-purple-800',
      healthInsurance: 'bg-red-100 text-red-800',
      lifeInsurance: 'bg-yellow-100 text-yellow-800',
      taxation: 'bg-orange-100 text-orange-800',
      nps: 'bg-teal-100 text-teal-800'
    }[product]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col ${currentTheme.cardBg} ${currentTheme.borderColor} hover:shadow-lg transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${currentTheme.selectedBg}`}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                {isEditing ? (
                  <>
                    <Input
                      value={editedClient.name || ''}
                      onChange={(e) => setEditedClient({...editedClient, name: e.target.value})}
                      className="text-lg font-semibold p-1 mb-2"
                    />
                    <Input
                      value={editedClient.email || ''}
                      onChange={(e) => setEditedClient({...editedClient, email: e.target.value})}
                      className="text-sm p-1"
                    />
                  </>
                ) : (
                  <>
                    <CardTitle className="text-lg font-semibold">
                      {client.name}
                    </CardTitle>
                    <p className={`text-sm ${currentTheme.mutedText}`}>
                      {client.email}
                    </p>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full"
            >
              <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {/* Product Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(isEditing ? editedClient.products || {} : client.products).map(([product, isActive]) => (
              <span 
                key={product}
                className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                  isActive ? getProductBadgeColor(product as keyof Client['products']) : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => {
                  if (isEditing) {
                    setEditedClient({
                      ...editedClient,
                      products: {
                        ...editedClient.products,
                        [product]: !isActive
                      }
                    })
                  }
                }}
              >
                {product.split(/(?=[A-Z])/).join(' ')}
              </span>
            ))}
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              {isEditing ? (
                <Input
                  value={editedClient.phone || ''}
                  onChange={(e) => setEditedClient({...editedClient, phone: e.target.value})}
                  className="text-sm p-1"
                />
              ) : (
                <span className="text-sm">{client.phone}</span>
              )}
            </div>
            {client.dob && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedClient.dob || ''}
                    onChange={(e) => setEditedClient({...editedClient, dob: e.target.value})}
                    className="text-sm p-1"
                  />
                ) : (
                  <span className="text-sm">
                    DOB: {new Date(client.dob).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>

        {/* Expanded Content */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className={`border-t ${currentTheme.borderColor} p-4`}>
            {/* SIP Dates - Only shown if SIP product is selected */}
            {(client.products.sip || (isEditing && editedClient.products?.sip)) && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedClient.sipStartDate || ''}
                      onChange={(e) => setEditedClient({...editedClient, sipStartDate: e.target.value})}
                      className="text-sm p-1"
                      placeholder="SIP Start Date"
                    />
                  ) : (
                    <span className="text-sm">
                      SIP Start: {client.sipStartDate && new Date(client.sipStartDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedClient.sipNextDate || ''}
                      onChange={(e) => setEditedClient({...editedClient, sipNextDate: e.target.value})}
                      className="text-sm p-1"
                      placeholder="Next SIP Date"
                    />
                  ) : (
                    <span className="text-sm">
                      Next SIP: {client.sipNextDate && new Date(client.sipNextDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between space-x-2">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEmailClick}
                  className="flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onWhatsAppClick}
                  className="flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
              
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onSaveEdit}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onCancelEdit}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={onEdit}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  )
}

// Client List Card Component (List View)
const ClientListCard = ({ 
  client, 
  onEdit, 
  onDelete,
  onEmailClick,
  onWhatsAppClick,
  theme,
  isEditing,
  editedClient,
  setEditedClient,
  onSaveEdit,
  onCancelEdit
}: {
  client: Client
  onEdit: () => void
  onDelete: () => void
  onEmailClick: () => void
  onWhatsAppClick: () => void
  theme: ThemeName
  isEditing: boolean
  editedClient: Partial<Client>
  setEditedClient: (client: Partial<Client>) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}) => {
  const currentTheme = themes[theme] || themes['blue-smoke']
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor} hover:shadow-md transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentTheme.selectedBg}`}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editedClient.name || ''}
                    onChange={(e) => setEditedClient({...editedClient, name: e.target.value})}
                    className="w-full"
                  />
                  <Input
                    value={editedClient.email || ''}
                    onChange={(e) => setEditedClient({...editedClient, email: e.target.value})}
                    className="w-full"
                  />
                </div>
              ) : (
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {client.name}
                  </CardTitle>
                  <p className={`text-sm ${currentTheme.mutedText}`}>
                    {client.email}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onSaveEdit}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onCancelEdit}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onEmailClick}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Add additional details here if needed */}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Helper function for button classes
function getButtonClasses(theme: ThemeName, variant: 'default' | 'danger' = 'default') {
  const currentTheme = themes[theme] || themes['blue-smoke']
  return variant === 'danger' 
    ? `bg-red-500 hover:bg-red-600 text-white ${currentTheme.buttonHover}`
    : `${currentTheme.buttonBg} ${currentTheme.buttonText} ${currentTheme.buttonHover}`
}

// Example themes object (make sure to define this or import it)
const themes = {
  'blue-smoke': {
    cardBg: 'bg-white',
    borderColor: 'border-gray-200',
    selectedBg: 'bg-blue-100 text-blue-800',
    mutedText: 'text-gray-600',
    buttonBg: 'bg-blue-500',
    buttonText: 'text-white',
    buttonHover: 'hover:bg-blue-600',
    inputBg: 'bg-white'
  }
  // Add other themes as needed
}