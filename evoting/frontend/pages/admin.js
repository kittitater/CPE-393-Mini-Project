import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

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
      const res = await axios.get(`${API_BASE}/api/admin/elections`, { headers });
      setElections(res.data);
      setIsReady(true);
    } catch {
      router.replace('/login');
    }
  };

  const loadElectionDetails = async (id) => {
    setSelectedElection(id);
    const [cand, result] = await Promise.all([
      axios.get(`${API_BASE}/api/admin/candidates?election_id=${id}`, { headers }),
      axios.get(`${API_BASE}/api/admin/results?election_id=${id}`, { headers }),
    ]);
    setCandidates(cand.data);
    setResults(result.data);
  };

  const createElection = async () => {
    try {
      await axios.post(`${API_BASE}/api/admin/elections`, { name: newElection }, { headers });
      setNewElection('');
      refreshElections();
    } catch {
      setError('❌ Failed to create election');
    }
  };

  const deleteElection = async (id) => {
    if (confirm('Are you sure you want to delete this election?')) {
      try {
        await axios.delete(`${API_BASE}/api/admin/elections/${id}`, { headers });
        setSelectedElection(null);
        refreshElections();
      } catch {
        setError('❌ Failed to delete election');
      }
    }
  };

  const toggleElectionOpen = async (id, isOpen) => {
    try {
      await axios.patch(`${API_BASE}/api/admin/elections/${id}`, { is_open: !isOpen }, { headers });
      refreshElections();
    } catch {
      setError('❌ Failed to update election state');
    }
  };

  const addCandidate = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/admin/candidates`,
        { name: newCandidate, election_id: selectedElection },
        { headers }
      );
      setNewCandidate('');
      loadElectionDetails(selectedElection);
    } catch {
      setError('❌ Failed to add candidate');
    }
  };

  const deleteCandidate = async (id) => {
    if (confirm('Delete this candidate?')) {
      try {
        await axios.delete(`${API_BASE}/api/admin/candidates/${id}`, { headers });
        loadElectionDetails(selectedElection);
      } catch {
        setError('❌ Failed to delete candidate');
      }
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
          <h3 className="text-xl mb-2">Manage Elections</h3>
          <div className="space-y-3">
            {elections.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/10">
                <button
                  onClick={() => loadElectionDetails(e.id)}
                  className="font-semibold text-left flex-grow text-white hover:text-cyber"
                >
                  {e.name}
                </button>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={e.is_open}
                    onChange={() => toggleElectionOpen(e.id, e.is_open)}
                  />
                  {e.is_open ? 'Open' : 'Closed'}
                </label>
                <button
                  onClick={() => deleteElection(e.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  🗑️
                </button>
              </div>
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
              <ul className="space-y-2 text-gray-300">
                {candidates.map((c) => (
                  <li key={c.id} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                    <span>{c.name}</span>
                    <button
                      onClick={() => deleteCandidate(c.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      🗑️
                    </button>
                  </li>
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
