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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/elections`, { headers });
      setElections(res.data);
      setIsReady(true);
    } catch {
      router.replace('/login');
    }
  };

  const loadElectionDetails = async (id) => {
    setSelectedElection(id);
    const [cand, result] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/candidates?election_id=${id}`, { headers }),
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/results?election_id=${id}`, { headers }),
    ]);
    setCandidates(cand.data);
    setResults(result.data);
  };

  const createElection = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/elections`, { name: newElection }, { headers });
      setNewElection('');
      refreshElections();
    } catch {
      setError('❌ Failed to create election');
    }
  };

  const addCandidate = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/candidates`, {
        name: newCandidate,
        election_id: selectedElection,
      }, { headers });
      setNewCandidate('');
      loadElectionDetails(selectedElection);
    } catch {
      setError('❌ Failed to add candidate');
    }
  };

  const toggleElectionState = async (e) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/elections/${e.id}`, {
        is_open: !e.is_open,
      }, { headers });
      refreshElections();
    } catch {
      setError('❌ Failed to update election state');
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
              className="flex-grow bg-white/10 text-white px-4 py-2 rounded-md focus:outline-none"
            />
            <button onClick={createElection} className="btn">Create</button>
          </div>
        </section>

        {/* Select Election */}
        <section className="mb-8">
          <h3 className="text-xl mb-2">Manage Elections</h3>
          <div className="grid grid-cols-1 gap-3">
            {elections.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-2 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <button
                  onClick={() => loadElectionDetails(e.id)}
                  className="font-semibold text-left text-white flex-grow hover:text-cyber transition"
                >
                  {e.name}
                </button>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={e.is_open}
                    onChange={() => toggleElectionState(e)}
                    className="form-checkbox accent-cyber w-4 h-4"
                  />
                  <span className={e.is_open ? 'text-green-400' : 'text-red-400'}>
                    {e.is_open ? 'Open' : 'Closed'}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Election Details */}
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
                  className="flex-grow bg-white/10 text-white px-4 py-2 rounded-md focus:outline-none"
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
