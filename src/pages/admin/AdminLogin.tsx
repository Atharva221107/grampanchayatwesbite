import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Navigate } from 'react-router-dom';
import { Building2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function AdminLogin() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login — Gram Panchayat</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-900 text-white mb-4">
              <Building2 size={28} />
            </div>
            <h1 className="text-2xl font-semibold text-primary-900">Admin Login</h1>
            <p className="text-sm text-primary-500 mt-1">Sign in to manage the portal</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-200 text-sm focus:border-accent-saffron focus:ring-1 focus:ring-accent-saffron transition-colors"
                  placeholder="admin@example.gov.in"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-200 text-sm focus:border-accent-saffron focus:ring-1 focus:ring-accent-saffron transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
