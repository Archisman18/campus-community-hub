import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SubmitScore() {
  const { match_id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [opponentName, setOpponentName] = useState('');
  const [myScore, setMyScore] = useState('');
  const [oppScore, setOppScore] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUserId(user.id);

      const { data: m } = await supabase.from('matches').select('*').eq('id', match_id).single();
      if (!m || (m.player1_id !== user.id && m.player2_id !== user.id)) return navigate('/tournaments');

      const opponentId = m.player1_id === user.id ? m.player2_id : m.player1_id;
      const { data: opponent } = await supabase.from('profiles').select('username').eq('id', opponentId).single();

      setMatch(m);
      setOpponentName(opponent?.username || 'Opponent');
      setLoading(false);
    }
    load();
  }, [match_id, navigate]);

  const handleSubmit = async () => {
    if (myScore === '' || oppScore === '') return setError('Enter both scores');
    setSubmitting(true);
    setError('');

    const isPlayer1 = match.player1_id === userId;
    const submission = isPlayer1 ? `${myScore}-${oppScore}` : `${oppScore}-${myScore}`;
    const field = isPlayer1 ? 'submission_a' : 'submission_b';

    const { data: updated, error: updateErr } = await supabase
      .from('matches').update({ [field]: submission, updated_at: new Date().toISOString() })
      .eq('id', match_id).select().single();

    if (updateErr) { setError(updateErr.message); setSubmitting(false); return; }

    if (!updated.submission_a || !updated.submission_b) {
      setMessage('Score submitted. Waiting for opponent.');
      setSubmitting(false);
      return;
    }

    if (updated.submission_a === updated.submission_b) {
      const [p1, p2] = updated.submission_a.split('-').map(Number);
      const winner_id = p1 > p2 ? match.player1_id : match.player2_id;

      await fetch(`http://localhost:3001/api/matches/${match_id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id }),
      });

      setMessage(`Match confirmed! Result: ${updated.submission_a}`);
    } else {
      await supabase.from('matches').update({ status: 'disputed' }).eq('id', match_id);
      setMessage('Scores conflict. Organiser has been notified.');
    }
    setSubmitting(false);
  };

  if (loading) return <p className="p-6">Loading match...</p>;

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-1">Submit Match Result</h2>
      <p className="text-slate-500 mb-4">Round {match.round} vs {opponentName}</p>
      {message ? <p className="text-green-600 font-medium">{message}</p> : (
        <>
          <label className="block text-sm mb-1">Your score</label>
          <input type="number" value={myScore} onChange={e => { setMyScore(e.target.value); setError(''); }} className="border rounded w-full p-2 mb-3" />
          <label className="block text-sm mb-1">{opponentName}'s score</label>
          <input type="number" value={oppScore} onChange={e => { setOppScore(e.target.value); setError(''); }} className="border rounded w-full p-2 mb-3" />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-slate-900 text-white rounded py-2 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Score'}
          </button>
        </>
      )}
    </div>
  );
}