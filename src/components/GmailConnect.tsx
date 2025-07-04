import { GoogleLogin } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';

const GmailConnect = () => {
  const handleGmailLogin = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      console.error("No credential received");
      return;
    }

    // Decode the ID token if needed
    const decoded: any = jwtDecode(credentialResponse.credential);
    console.log("Google User:", decoded);

    // Send token to backend to fetch Gmail
    const res = await fetch('/api/gmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    const data = await res.json();
    console.log("Emails:", data);
  };

  return (
    <GoogleLogin
      onSuccess={handleGmailLogin}
      onError={() => console.log('Google Login Failed')}
      useOneTap
      scope="https://www.googleapis.com/auth/gmail.readonly"
    />
  );
};

export default GmailConnect;