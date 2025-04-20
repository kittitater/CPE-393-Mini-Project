import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Admin() {
  const [isReady, setIsReady] = useState(false);
  const [elections, setElections] = useState([]);
  const [newElection, setNewElection] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const refreshElections = async () => {
    try {
      const res = await axios.get('/api/admin/elections', { headers });
      setElections(res.data);
      setIsReady(true);
    } catch {
      router.replace('/login');
    }
  };

  const loadElectionDetails = async (id) => {
    setSelectedElection(id);
    const [cand, result] = await Promise.all([
      axios.get(`/api/admin/candidates?election_id=${id}`, { headers }),
      axios.get(`/api/admin/results?election_id=${id}`, { headers }),
    ]);
    setCandidates(cand.data);
    setResults(result.data);
  };

  const createElection = async () => {
    try {
      await axios.post('/api/admin/elections', { name: newElection }, { headers });
      setNewElection('');
      refreshElections();
    } catch {
      setError('❌ Failed to create election');
    }
  };

  const addCandidate = async () => {
    try {
      await axios.post('/api/admin/candidates', {
        name: newCandidate,
        election_id: selectedElection,
      }, { headers });
      setNewCandidate('');
      loadElectionDetails(selectedElection);
    } catch {
      setError('❌ Failed to add candidate');
    }
  };

  useEffect(() => {
    refreshElections();
  }, []);

  if (!isReady) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 bg-glass-white rounded-xl shadow-lg border border-white/10">
        <h2 className="text-3xl text-cyber mb-6 text-center">🧠 Admin Dashboard</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Create Election */}
        <section className="mb-8">
          <h3 className="text-xl mb-2">Create New Election</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Election name"
              value={newElection}
              onChange={(e) => setNewElection(e.target.value)}
              className="flex-grow"
            />
            <button onClick={createElection} className="btn">Create</button>
          </div>
        </section>

        {/* Select Election */}
        <section className="mb-8">
          <h3 className="text-xl mb-2">Select Election</h3>
          <div className="grid grid-cols-2 gap-3">
            {elections.map((e) => (
              <button
                key={e.id}
                onClick={() => loadElectionDetails(e.id)}
                className={`p-3 rounded-lg text-left font-semibold transition ${
                  selectedElection === e.id
                    ? 'bg-cyber text-cyber-dark'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>
        </section>

        {selectedElection && (
          <>
            {/* Add Candidate */}
            <section className="mb-8">
              <h3 className="text-xl mb-2">Add Candidate</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Candidate name"
                  value={newCandidate}
                  onChange={(e) => setNewCandidate(e.target.value)}
                  className="flex-grow"
                />
                <button onClick={addCandidate} className="btn">Add</button>
              </div>
            </section>

            {/* Candidate List */}
            <section className="mb-8">
              <h3 className="text-xl mb-2">Candidates</h3>
              <ul className="list-disc list-inside text-gray-300">
                {candidates.map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </section>

            {/* Results */}
            <section>
              <h3 className="text-xl mb-2">Results</h3>
              <ul className="list-disc list-inside text-gray-300">
                {results.map((r, i) => (
                  <li key={i}>
                    {r.candidate}: <strong>{r.votes}</strong> votes
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
