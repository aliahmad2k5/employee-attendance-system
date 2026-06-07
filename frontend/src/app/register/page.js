'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';import API from '@/utils/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await API.post('/auth/register', formData);
      setMessage(res.data.message || 'Registration successful! Redirecting...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md space-y-6 bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-3xl font-bold text-center tracking-tight text-blue-500">Create Account</h2>
        {message && <div className="p-3 bg-green-600/20 text-green-400 rounded text-sm text-center border border-green-600/30">{message}</div>}
        {error && <div className="p-3 bg-red-600/20 text-red-400 rounded text-sm text-center border border-red-600/30">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" required className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input type="email" required className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">System Role</label>
            <select className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3 mt-2 font-semibold rounded bg-blue-600 hover:bg-blue-700 transition duration-200">Sign Up</button>
        </form>
      </div>
    </div>
  );
}