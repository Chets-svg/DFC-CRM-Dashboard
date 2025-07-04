import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';

export function GmailConnectButton() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if user has connected Gmail
    const token = localStorage.getItem('gmailAccessToken');
    setIsConnected(!!token);
  }, []);

  const handleConnect = () => {
    // Initiate OAuth flow
    window.location.href = '/api/auth/google';
  };

  const handleDisconnect = () => {
    // Clear Gmail tokens
    localStorage.removeItem('gmailAccessToken');
    localStorage.removeItem('gmailRefreshToken');
    setIsConnected(false);
  };

  return (
    <div className="mb-4">
      {isConnected ? (
        <Button variant="outline" onClick={handleDisconnect}>
          <Mail className="mr-2 h-4 w-4" />
          Disconnect Gmail
        </Button>
      ) : (
        <Button onClick={handleConnect}>
          <Mail className="mr-2 h-4 w-4" />
          Connect Gmail
        </Button>
      )}
    </div>
  );
}