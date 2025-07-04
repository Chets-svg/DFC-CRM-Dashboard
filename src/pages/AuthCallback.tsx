import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      fetch('http://localhost:5000/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.accessToken) {
            localStorage.setItem('gmail_token', data.accessToken);
            navigate('/emails'); // ✅ Go to email inbox or wherever you want
          } else {
            console.error('No token returned');
          }
        })
        .catch(err => {
          console.error('Callback error:', err);
        });
    }
  }, []);

  return <p>Authenticating with Google...</p>;
};

export default AuthCallback;