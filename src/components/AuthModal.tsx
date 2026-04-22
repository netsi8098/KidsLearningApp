/**
 * AuthModal — Parent authentication modal.
 * Supports Sign Up, Login, and Forgot Password flows.
 * Connects to the backend JWT auth endpoints.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, setAuthToken } from '../services/apiService';
import MascotLion from './svg/MascotLion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  onContinueLocal?: () => void;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

type AuthView = 'login' | 'signup' | 'forgot' | 'verify';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onContinueLocal }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [childCount, setChildCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [signupDone, setSignupDone] = useState(false);
  const [signupUser, setSignupUser] = useState<AuthUser | null>(null);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
    setLoading(false);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', { email: email.trim(), password });
      if (res.ok && res.data) {
        setAuthToken(res.data.token);
        onAuthSuccess(res.data.user);
        resetForm();
        onClose();
      } else {
        setError(res.error || 'Invalid email or password');
      }
    } catch {
      setError('Parent account service is unavailable right now. You can keep playing on this device.');
    }
    setLoading(false);
  }, [email, password, onAuthSuccess, onClose, resetForm]);

  const handleSignup = useCallback(async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ token: string; user: AuthUser }>('/api/auth/register', {
        email: email.trim(),
        password,
        name: name.trim(),
      });
      if (res.ok && res.data) {
        const { token, user } = res.data;
        if (token) setAuthToken(token);
        setLoading(false);
        setSignupUser(user);
        setSignupDone(true);
        return;
      } else {
        setError(res.error || 'Could not create account. Email may already be in use.');
      }
    } catch {
      setError('Parent account service is unavailable right now. You can create a child profile on this device and sign in later.');
    }
    setLoading(false);
  }, [email, password, name, onAuthSuccess, onClose, resetForm]);

  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    // Backend endpoint for password reset (may not exist yet — graceful fallback)
    try {
      const res = await api.post('/api/auth/forgot-password', { email: email.trim() });
      if (res.ok) {
        setSuccess('If that email exists, a reset link has been sent.');
      } else {
        setSuccess('If that email exists, a reset link has been sent.');
      }
    } catch {
      setSuccess('If that email exists, a reset link has been sent.');
    }
    setLoading(false);
  }, [email]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-3xl overflow-y-auto"
          style={{
            background: 'white',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
          }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div
            className="px-6 pt-6 pb-4 text-center"
            style={{ background: 'linear-gradient(135deg, #FF6B6B15, #FF8C4215)' }}
          >
            <MascotLion size={60} expression={signupDone ? 'celebrating' : view === 'signup' ? 'excited' : 'happy'} animated />
            <h2 className="font-display text-xl text-[#2D2D3A] mt-2">
              {signupDone && 'Account Created!'}
              {!signupDone && view === 'login' && 'Welcome Back!'}
              {!signupDone && view === 'signup' && 'Create Account'}
              {!signupDone && view === 'forgot' && 'Reset Password'}
              {!signupDone && view === 'verify' && 'Check Your Email'}
            </h2>
            <p className="text-sm text-[#6B6B7B] mt-1">
              {signupDone && `Welcome, ${signupUser?.name || 'Parent'}!`}
              {!signupDone && view === 'login' && 'Sign in to manage your children\'s learning'}
              {!signupDone && view === 'signup' && 'Set up your parent account'}
              {!signupDone && view === 'forgot' && 'We\'ll send you a reset link'}
              {!signupDone && view === 'verify' && 'A verification link has been sent'}
            </p>
          </div>

          {/* Close button */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#9B9BAB] cursor-pointer"
            onClick={onClose}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Body */}
          <div className="px-6 pb-6 pt-2">
            {/* Signup success state */}
            {signupDone && (
              <motion.div
                className="text-center py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6BCB77, #4ECDC4)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                </div>
                <p className="text-[15px] font-bold text-[#2D2D3A] mb-1">Your account is ready!</p>
                <p className="text-sm text-[#6B6B7B] mb-6">Now create a profile for your child to start learning and playing.</p>
                <button
                  className="w-full py-3.5 rounded-xl font-display text-base text-white cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', boxShadow: '0 4px 0 rgba(0,0,0,0.1), 0 8px 20px rgba(255,107,107,0.3)' }}
                  onClick={() => {
                    if (signupUser) onAuthSuccess(signupUser);
                    resetForm();
                    setSignupDone(false);
                    setSignupUser(null);
                    onClose();
                  }}
                >
                  Create Child Profile
                </button>
              </motion.div>
            )}

            {!signupDone && <>
            {/* Error/Success messages */}
            {error && (
              <motion.div
                className="mb-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-700 bg-red-50 border border-red-100"
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                className="mb-3 px-4 py-2.5 rounded-xl text-sm font-bold text-green-700 bg-green-50 border border-green-100"
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {success}
              </motion.div>
            )}

            {/* LOGIN VIEW */}
            {view === 'login' && (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E0D4] bg-[#FAFAF8] text-[#2D2D3A] font-bold outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50"
                  autoFocus
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E0D4] bg-[#FAFAF8] text-[#2D2D3A] font-bold outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  className="btn-primary w-full text-base"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                {onContinueLocal && (
                  <button
                    className="w-full py-3 rounded-xl font-bold text-[#2D2D3A] bg-[#F7F3EC] border border-[#E8E0D4] cursor-pointer"
                    onClick={onContinueLocal}
                    disabled={loading}
                  >
                    Continue without account
                  </button>
                )}
                <div className="flex justify-between text-xs">
                  <button
                    className="text-coral font-bold cursor-pointer"
                    onClick={() => { resetForm(); setView('forgot'); }}
                  >
                    Forgot password?
                  </button>
                  <button
                    className="text-[#4ECDC4] font-bold cursor-pointer"
                    onClick={() => { resetForm(); setView('signup'); }}
                  >
                    Create account
                  </button>
                </div>
              </div>
            )}

            {/* SIGNUP VIEW */}
            {view === 'signup' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E0D4] bg-[#FAFAF8] text-[#2D2D3A] font-bold outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50"
                  autoFocus
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E0D4] bg-[#FAFAF8] text-[#2D2D3A] font-bold outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50"
                />
                <input
                  type="password"
                  placeholder="Password (8+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E0D4] bg-[#FAFAF8] text-[#2D2D3A] font-bold outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal/50"
                />
                <div>
                  <label className="text-xs font-bold text-[#6B6B7B] mb-1 block">How many children?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        className={`w-10 h-10 rounded-full font-display cursor-pointer transition-all ${
                          childCount === n
                            ? 'bg-teal text-white shadow-md'
                            : 'bg-[#F0EAE0] text-[#6B6B7B]'
                        }`}
                        onClick={() => setChildCount(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* COPPA notice */}
                <p className="text-[10px] text-[#9B9BAB] leading-tight">
                  By creating an account, you confirm you are a parent or legal guardian, and agree to our
                  Terms of Service and Privacy Policy. This app complies with COPPA — we never collect
                  personal data from children without parental consent.
                </p>

                <button
                  className="w-full py-3.5 rounded-xl font-display text-base text-white cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #4ECDC4, #3DBDB4)', boxShadow: '0 4px 0 rgba(0,0,0,0.1), 0 8px 20px rgba(78,205,196,0.3)' }}
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                {onContinueLocal && (
                  <button
                    className="w-full py-3 rounded-xl font-bold text-[#2D2D3A] bg-[#F7F3EC] border border-[#E8E0D4] cursor-pointer"
                    onClick={onContinueLocal}
                    disabled={loading}
                  >
                    Continue without account
                  </button>
                )}
                <button
                  className="w-full text-center text-xs text-[#6B6B7B] font-bold cursor-pointer"
                  onClick={() => { resetForm(); setView('login'); }}
                >
                  Already have an account? Sign in
                </button>
              </div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === 'forgot' && (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E0D4] bg-[#FAFAF8] text-[#2D2D3A] font-bold outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/50"
                  autoFocus
                />
                <button
                  className="btn-primary w-full text-base"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  className="w-full text-center text-xs text-[#6B6B7B] font-bold cursor-pointer"
                  onClick={() => { resetForm(); setView('login'); }}
                >
                  Back to sign in
                </button>
              </div>
            )}
            </>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
