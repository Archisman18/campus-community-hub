import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OrganiserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_organiser')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (!profile?.is_organiser) {
        await supabase.auth.signOut();
        setError('This account is not registered as a tournament organiser.');
        setLoading(false);
        return;
      }

      navigate('/organiser');

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10">
        <p className="text-blue-600 font-bold tracking-widest text-xs mb-2">
          TOURNAMENT HUB · ORGANISER ACCESS
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Organiser Sign In
        </h1>
        <p className="text-slate-500 mb-8">
          Manage tournaments, brackets, and disputes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organiser@example.com"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-semibold rounded-lg py-3 hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In as Organiser'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Not an organiser?{' '}
          <Link to="/login" className="text-blue-600 font-medium">
            Student login here
          </Link>
        </p>
      </div>
    </div>
  );
}