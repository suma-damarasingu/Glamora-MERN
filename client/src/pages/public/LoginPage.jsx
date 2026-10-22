import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Sparkles, Mail, Lock, KeyRound, ArrowRight, RefreshCw, ShieldCheck, UserCheck, Shield } from 'lucide-react';

const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const [loginMode, setLoginMode] = useState(roleParam === 'admin' ? 'admin' : 'customer');

  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP verification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  const { login, verifyLoginOtp, resendOtp, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Automatically redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('glamora_token');
    const storedUser = localStorage.getItem('glamora_user')
      ? JSON.parse(localStorage.getItem('glamora_user'))
      : null;
    const activeUser = user || storedUser;

    if ((isAuthenticated || token) && activeUser) {
      const target = activeUser.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Keep mode in sync with URL search param if present
  useEffect(() => {
    if (roleParam === 'admin' || roleParam === 'customer') {
      setLoginMode(roleParam);
    }
  }, [roleParam]);

  const handleModeChange = (mode) => {
    setLoginMode(mode);
    setStep(1);
    setEmail('');
    setPassword('');
    setOtp('');
    setDevOtpHint('');
    setSearchParams(mode === 'admin' ? { role: 'admin' } : {});
  };

  // Step 1: Submit credentials (direct JWT authentication with 2FA fallback)
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password, loginMode);

      // Direct JWT Authentication Flow (instant seamless sign-in)
      if (res.success && res.token) {
        const userRole = res.user?.role;
        console.log(`[LoginPage] Login successful for '${res.user?.email}' as [${userRole}]`);
        toast.success(`Welcome back, ${res.user?.name || 'User'}!`);

        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      // 2FA OTP Fallback flow
      if (res.success && res.requireOtp) {
        if (loginMode === 'admin' && res.role !== 'admin') {
          toast.error('Access Denied: This account does not possess administrator privileges.');
          return;
        }

        if (loginMode === 'customer' && res.role === 'admin') {
          toast.error('Administrator account detected. Please switch to Admin Login.');
          return;
        }

        toast.success(res.message || 'OTP sent to your email!');
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
        }
        setStep(2);
      }
    } catch (error) {
      console.error('[LoginPage] Login submission failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMsg =
        error.response?.data?.message ||
        (error.message === 'Network Error'
          ? 'Network Error: Cannot connect to Glamora server. Please check your connection.'
          : 'Invalid email or password. Please verify your credentials.');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit 6-digit OTP to receive JWT (if 2FA was required)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyLoginOtp(email.trim(), otp.trim());
      if (res.success) {
        const userRole = res.user?.role;
        console.log(`[LoginPage] OTP verification successful for '${res.user?.email}' as [${userRole}]`);

        if (loginMode === 'admin' && userRole !== 'admin') {
          toast.error('Access Denied: Unauthorized administrative access attempt.');
          return;
        }

        toast.success('Signed in successfully!');
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('[LoginPage] OTP verification failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const res = await resendOtp(email.trim(), 'Login 2-Step Verification');
      toast.success(res.message || 'A new verification code has been sent.');
      if (res.devOtp) setDevOtpHint(res.devOtp);
    } catch (error) {
      toast.error('Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const isAdminMode = loginMode === 'admin';

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-8 sm:p-10 relative overflow-hidden">
        {/* Ambient blush accent */}
        <div
          className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${
            isAdminMode ? 'bg-slate-200/50' : 'bg-rose-100/50'
          }`}
        ></div>

        {/* Role Toggle Selector */}
        {step === 1 && (
          <div className="mb-6 p-1 bg-slate-100/80 rounded-2xl flex items-center border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleModeChange('customer')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isAdminMode
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Customer Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('admin')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isAdminMode
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Login
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-md mb-3 text-white transition-colors duration-300 ${
              isAdminMode
                ? 'bg-slate-900 shadow-slate-300'
                : 'bg-gradient-to-tr from-rose-600 to-pink-500 shadow-rose-200'
            }`}
          >
            {isAdminMode ? <Shield className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 1
              ? isAdminMode
                ? 'Admin Login'
                : 'Welcome Back to Glamora'
              : '2-Step Verification'}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {step === 1
              ? isAdminMode
                ? 'Sign in with administrative credentials to manage Glamora salon operations.'
                : 'Sign in to access your appointments & beauty dashboard.'
              : `Enter the 6-digit OTP code sent to ${email}`}
          </p>

          {isAdminMode && step === 1 && (
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
              <ShieldCheck className="w-3 h-3" />
              Restricted Portal
            </div>
          )}
        </div>

        {/* STEP 1: Email + Password */}
        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isAdminMode ? 'Administrator Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdminMode ? 'admin@glamora.com' : 'e.g. customer@glamora.com'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {isAdminMode ? 'Admin Password' : 'Password'}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md ${
                isAdminMode
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-200'
              }`}
            >
              {loading
                ? 'Verifying...'
                : isAdminMode
                ? 'Authenticate Admin'
                : 'Continue to Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: 2-Step OTP Verification */
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Two-step security active. Check your email inbox for your 6-digit code.</span>
            </div>

            {devOtpHint && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-mono text-center">
                🔑 <strong>Server OTP Log:</strong> {devOtpHint}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-rose-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  maxLength="6"
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-rose-300 text-center text-2xl font-extrabold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all active:scale-98 disabled:opacity-50 shadow-md ${
                isAdminMode
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-200'
              }`}
            >
              {loading ? 'Verifying Code...' : 'Verify OTP & Log In'}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800 font-semibold"
              >
                ← Back to credentials
              </button>
              <button
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* Footer Area: Customer registration link ONLY when in Customer mode */}
        {!isAdminMode ? (
          <div className="mt-8 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-rose-600 hover:underline">
              Register as Customer
            </Link>
          </div>
        ) : (
          <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Authorized Administrative Personnel Only</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
