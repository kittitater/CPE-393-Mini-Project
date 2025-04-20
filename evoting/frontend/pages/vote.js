// pages/vote.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Vote() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    axios
      .get('/api/vote/elections', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setElections(res.data))
      .catch(() => {
        setError('⚠️ Failed to load elections. Login again.');
        router.push('/login');
      });
  }, [router]);

  const loadCandidates = async (electionId) => {
    setSelectedElection(electionId);
    try {
      const res = await axios.get(`/api/vote/candidates?election_id=${electionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCandidates(res.data);
    } catch {
      setError('❌ Failed to load candidates');
    }
  };

  const submitVote = async () => {
    if (!selectedCandidate) return setError('Please select a candidate.');
    try {
      const res = await axios.post(
        '/api/vote/cast',
        { candidate_id: selectedCandidate },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReceipt(res.data.receipt);
    } catch {
      setError('❌ Failed to cast vote');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-glass-white rounded-xl shadow-lg border border-white/10">
        <h2 className="text-3xl text-cyber text-center mb-6">🗳️ Cast Your Vote</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {!selectedElection ? (
          <>
            <h3 className="text-xl mb-4 text-center">Select Election</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {elections.map((e) => (
                <button
                  key={e.id}
                  onClick={() => loadCandidates(e.id)}
                  className="p-4 rounded-lg bg-white/10 hover:bg-cyber text-white text-lg transition font-bold tracking-wide border border-white/20"
                >
                  {e.name}
                </button>
              ))}
            </div>
          </>
        ) : receipt ? (
          <div className="text-center">
            <h3 className="text-green-400 text-xl mb-3">✅ Vote Cast Successfully</h3>
            <p className="text-sm">Receipt Code:</p>
            <code className="bg-black/30 p-3 rounded block mt-2">{receipt}</code>
          </div>
        ) : (
          <>
            <h3 className="text-xl mb-4 text-center">Select Candidate</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {candidates.map((c) => (
                <label
                  key={c.id}
                  className={`cursor-pointer p-4 rounded-lg border text-center font-semibold transition ${
                    selectedCandidate === c.id
                      ? 'border-cyber bg-cyber/20 text-cyber'
                      : 'border-white/20 bg-white/5 hover:border-cyber'
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    className="hidden"
                    checked={selectedCandidate === c.id}
                    onChange={() => setSelectedCandidate(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
            <button onClick={submitVote} className="btn w-full mt-6">Submit Vote</button>
          </>
        )}
      </div>
    </Layout>
  );
}
