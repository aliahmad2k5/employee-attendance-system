'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await API.post('/auth/login', formData);
      
      // Store the token and user data securely in local storage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setMessage('Login successful! Redirecting...');
      
      // Redirect based on role-based access control guidelines
      if (res.data.user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md space-y-6 bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-3xl font-bold text-center tracking-tight text-blue-500">Account Login</h2>
        {message && <div className="p-3 bg-green-600/20 text-green-400 rounded text-sm text-center border border-green-600/30">{message}</div>}
        {error && <div className="p-3 bg-red-600/20 text-red-400 rounded text-sm text-center border border-red-600/30">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input type="email" required className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <button type="submit" className="w-full py-3 mt-2 font-semibold rounded bg-blue-600 hover:bg-blue-700 transition duration-200">Sign In</button>
        </form>
      </div>
    </div>
  );
}