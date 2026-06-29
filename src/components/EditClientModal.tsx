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
import { ThemeName, themes, getButtonClasses, isNeon } from '@/lib/theme';
import { Client } from '@/types/client';

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
  const neon = isNeon(theme);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedClient(prev => ({ ...prev, [name]: value }));
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

  const inputClasses = neon
    ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-600/50 focus:border-cyan-400 focus:ring-cyan-500/20'
    : `${currentTheme.inputBg} ${currentTheme.borderColor}`;

  const labelClasses = neon
    ? 'text-cyan-300/80'
    : '';

  const sectionTitleClasses = neon
    ? 'text-cyan-400 font-semibold tracking-wide uppercase text-xs'
    : 'font-medium';

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className={`${
        neon
          ? 'bg-gray-950 border-cyan-500/20 shadow-[0_0_40px_rgba(0,255,255,0.08)]'
          : `${currentTheme.cardBg} ${currentTheme.borderColor}`
      } max-w-4xl`}>
        <DialogHeader>
          <DialogTitle className={neon ? 'text-cyan-300' : ''}>
            Edit Client
          </DialogTitle>
          <DialogDescription className={neon ? 'text-cyan-500/60' : ''}>
            Edit all details for {client.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className={`space-y-3 p-4 rounded-xl ${
            neon ? 'bg-cyan-950/20 border border-cyan-500/10' : ''
          }`}>
            <h3 className={sectionTitleClasses}>Basic Information</h3>
            
            <div>
              <Label className={`mb-1 block ${labelClasses}`}>Full Name *</Label>
              <Input
                name="name"
                value={editedClient.name}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <Label className={`mb-1 block ${labelClasses}`}>Email *</Label>
              <Input
                name="email"
                type="email"
                value={editedClient.email}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <Label className={`mb-1 block ${labelClasses}`}>Phone *</Label>
              <Input
                name="phone"
                value={editedClient.phone}
                onChange={handleInputChange}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <Label className={`mb-1 block ${labelClasses}`}>CAN Number</Label>
              <Input
                name="can"
                value={editedClient.can || ''}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Enter CAN number"
              />
            </div>
            <div>
              <Label className={`mb-1 block ${labelClasses}`}>Address</Label>
              <Input
                name="address"
                value={editedClient.address || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Dates Section */}
          <div className={`space-y-3 p-4 rounded-xl ${
            neon ? 'bg-fuchsia-950/20 border border-fuchsia-500/10' : ''
          }`}>
            <h3 className={neon ? 'text-fuchsia-400 font-semibold tracking-wide uppercase text-xs' : sectionTitleClasses}>Important Dates</h3>
            <div>
              <Label className={`mb-1 block ${labelClasses}`}>Date of Birth</Label>
              <Input
                type="date"
                name="dob"
                value={editedClient.dob || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            <div>
              <Label className={`mb-1 block ${labelClasses}`}>Marriage Anniversary</Label>
              <Input
                type="date"
                name="marriageAnniversary"
                value={editedClient.marriageAnniversary || ''}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            <div>
              <Label className={`mb-1 block ${labelClasses}`}>Risk Profile</Label>
              <Select
                value={editedClient.riskProfile || 'moderate'}
                onValueChange={(value) => setEditedClient(prev => ({
                  ...prev,
                  riskProfile: value as 'conservative' | 'moderate' | 'aggressive'
                }))}
              >
                <SelectTrigger className={inputClasses}>
                  <SelectValue placeholder="Select risk profile" />
                </SelectTrigger>
                <SelectContent className={
                  neon
                    ? 'bg-gray-950 border-cyan-500/30 text-cyan-100'
                    : `${currentTheme.cardBg} ${currentTheme.borderColor}`
                }>
                  <SelectItem value="conservative" className={neon ? 'focus:bg-cyan-900/30 focus:text-cyan-200' : ''}>
                    Conservative
                  </SelectItem>
                  <SelectItem value="moderate" className={neon ? 'focus:bg-cyan-900/30 focus:text-cyan-200' : ''}>
                    Moderate
                  </SelectItem>
                  <SelectItem value="aggressive" className={neon ? 'focus:bg-cyan-900/30 focus:text-cyan-200' : ''}>
                    Aggressive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Section */}
          <div className={`md:col-span-2 space-y-3 p-4 rounded-xl ${
            neon ? 'bg-green-950/20 border border-green-500/10' : ''
          }`}>
            <h3 className={neon ? 'text-green-400 font-semibold tracking-wide uppercase text-xs' : sectionTitleClasses}>
              Investment Products
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(editedClient.products).map(([product, isSelected]) => (
                <div key={product} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  neon
                    ? isSelected
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'border border-transparent hover:border-green-500/20'
                    : ''
                }`}>
                  <Checkbox
                    id={`product-${product}`}
                    checked={isSelected}
                    onCheckedChange={() => handleProductToggle(product as keyof Client['products'])}
                    className={neon ? 'border-green-500/50 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-400' : ''}
                  />
                  <Label
                    htmlFor={`product-${product}`}
                    className={`text-sm font-normal capitalize ${
                      neon ? (isSelected ? 'text-green-300' : 'text-cyan-600') : ''
                    }`}
                  >
                    {product.split(/(?=[A-Z])/).join(' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className={`md:col-span-2 p-4 rounded-xl ${
            neon ? 'bg-amber-950/20 border border-amber-500/10' : ''
          }`}>
            <Label className={`mb-1 block ${neon ? 'text-amber-400' : labelClasses}`}>Notes</Label>
            <Textarea
              value={editedClient.notes || ''}
              onChange={(e) => setEditedClient(prev => ({ ...prev, notes: e.target.value }))}
              className={inputClasses}
              placeholder="Additional notes about the client..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className={`rounded-xl ${
              neon
                ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400'
                : getButtonClasses(theme, 'outline')
            }`}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(editedClient)}
            className={`rounded-xl ${
              neon
                ? 'bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-semibold shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]'
                : getButtonClasses(theme)
            }`}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}