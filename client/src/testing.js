// In AuthModal.js
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  setError('');
  
  try {
    // Update these URLs to point to your Railway backend
    const BACKEND_URL = 'https://campus-trade-deep-production.up.railway.app';
    const endpoint = type === 'login' ? 
      `${BACKEND_URL}/api/users/login` : 
      `${BACKEND_URL}/api/users/register`;
    
    const payload = type === 'login' 
      ? { email: formData.email, password: formData.password }
      : { 
          email: formData.email, 
          password: formData.password, 
          username: formData.username,
          university: formData.university 
        };
    
    const { data } = await axios.post(endpoint, payload);
    // Rest of your code...
  } catch (err) {
    // ...
  }
};