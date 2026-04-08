import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { loginWithGoogle } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) return;
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await loginWithGoogle(credentialResponse.credential);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500 opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center">

          {/* Logo */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
              <img src="/liimra-logo.png" alt="LIIMRA Naturals" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">LIIMRA NATURALS</h1>
            <p className="text-brand-300 text-sm mt-1">Distribution Platform</p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mb-6" />

          {/* Welcome text */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in with your Google account to continue</p>
          </div>

          {/* Google sign-in button */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-white text-sm py-3">
              <svg className="animate-spin w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-slate-300">Verifying...</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed.')}
                useOneTap={false}
                shape="pill"
                size="large"
                text="signin_with"
                theme="outline"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3">
              <p className="text-red-300 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Access note */}
          <p className="mt-6 text-slate-500 text-xs leading-relaxed">
            Access is restricted to authorised LIIMRA Naturals administrators only.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 LIIMRA Naturals · Distribution Platform v2.0
        </p>
      </div>
    </div>
  );
}
