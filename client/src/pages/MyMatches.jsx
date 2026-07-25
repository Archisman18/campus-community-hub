import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: matchRows, error } = await supabase
        .from('matches')
        .select('*, tournaments(name, game)')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .neq('status', 'confirmed')
        .order('updated_at', { ascending: false });

      if (error) { console.error(error); setLoading(false); return; }

      const opponentIds = matchRows
        .map(m => (m.player1_id === user.id ? m.player2_id : m.player1_id))
        .filter(Boolean);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', opponentIds);

      const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.username]));

      setMatches(matchRows.map(m => ({
        ...m,
        opponentName: nameMap[m.player1_id === user.id ? m.player2_id : m.player1_id] || 'TBD',
      })));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="p-6">Loading your matches...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-1">My Matches</h2>
      <p className="text-slate-500 mb-6">Matches waiting on a result.</p>

      {matches.length === 0 ? (
        <p className="text-slate-500">No pending matches right now.</p>
      ) : (
        <div className="space-y-3">
          {matches.map(m => (
            <div key={m.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{m.tournaments?.name} · Round {m.round}</p>
                <p className="text-sm text-slate-500">vs {m.opponentName}</p>
              </div>
              {m.status === 'disputed' ? (
                <span className="text-red-500 text-sm font-medium">Disputed</span>
              ) : (
                <Link to={`/match/${m.id}`} className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg">
                  Submit Score
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}