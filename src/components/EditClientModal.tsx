"use client";

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { ThemeName, themes, getButtonClasses } from '@/lib/theme';
import { Client } from '@/types/client'; // Adjust path as needed

interface EditClientModalProps {
  client: Client;
  onSave: (updatedClient: Client) => void;
  onCancel: () => void;
  theme: ThemeName;
}

export function EditClientModal({
  client,
  onSave,
  onCancel,
  theme
}: EditClientModalProps) {
  const [editedClient, setEditedClient] = useState<Client>(client);
  const currentTheme = themes[theme] || themes['blue-smoke'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedClient(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: keyof Client, date: Date | undefined) => {
    setEditedClient(prev => ({
      ...prev,
      [name]: date?.toISOString().split('T')[0] || ''
    }));
  };

  const handleProductToggle = (product: keyof Client['products']) => {
    setEditedClient(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: !prev.products[product]
      }
    }));
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className={`${currentTheme.cardBg} ${currentTheme.borderColor} max-w-4xl`}>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Edit all details for {client.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="font-medium">Basic Information</h3>
            
            <div>
              <Label className="mb-1 block">Full Name *</Label>
              <Input
                name="name"
                value={editedClient.name}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Email *</Label>
              <Input
                name="email"
                type="email"
                value={editedClient.email}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Phone *</Label>
              <Input
                name="phone"
                value={editedClient.phone}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">CAN Number</Label>
              <Input
                name="can"
                value={editedClient.can || ''}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
                placeholder="Enter CAN number"
              />
            </div>
            <div>
              <Label className="mb-1 block">Address</Label>
              <Input
                name="address"
                value={editedClient.address || ''}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
              />
            </div>
          </div>

          {/* Dates Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Important Dates</h3>
            <div>
              <Label className="mb-1 block">Date of Birth</Label>
              <Input
                type="date"
                name="dob"
                value={editedClient.dob || ''}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
              />
            </div>
            <div>
              <Label className="mb-1 block">Marriage Anniversary</Label>
              <Input
                type="date"
                name="marriageAnniversary"
                value={editedClient.marriageAnniversary || ''}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
              />
            </div>
            <div>
              <Label className="mb-1 block">Risk Profile</Label>
              <Select
                value={editedClient.riskProfile || 'moderate'}
                onValueChange={(value) => setEditedClient(prev => ({
                  ...prev,
                  riskProfile: value as 'conservative' | 'moderate' | 'aggressive'
                }))}
              >
                <SelectTrigger className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}>
                  <SelectValue placeholder="Select risk profile" />
                </SelectTrigger>
                <SelectContent className={`${currentTheme.cardBg} ${currentTheme.borderColor}`}>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Section */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-medium">Investment Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(editedClient.products).map(([product, isSelected]) => (
                <div key={product} className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-${product}`}
                    checked={isSelected}
                    onCheckedChange={() => handleProductToggle(product as keyof Client['products'])}
                  />
                  <Label htmlFor={`product-${product}`} className="text-sm font-normal capitalize">
                    {product.split(/(?=[A-Z])/).join(' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="md:col-span-2">
            <Label className="mb-1 block">Notes</Label>
            <Textarea
              value={editedClient.notes || ''}
              onChange={(e) => setEditedClient(prev => ({ ...prev, notes: e.target.value }))}
              className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
              placeholder="Additional notes about the client..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className={getButtonClasses(theme, 'outline')}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(editedClient)}
            className={getButtonClasses(theme)}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}