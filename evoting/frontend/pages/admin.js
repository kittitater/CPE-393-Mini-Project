// pages/admin.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Admin() {
  const [isReady, setIsReady] = useState(false);
  const [elections, setElections] = useState([]);
  const [newElection, setNewElection] = useState('');
  const [newElectionTime, setNewElectionTime] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState('');
  const [results, setResults] = useState([]);
  const [hasVotes, setHasVotes] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    refreshElections();
  }, []);

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
    const withEditState = cand.data.map(c => ({
      ...c,
      editing: false,
      newName: c.name
    }));
    setCandidates(withEditState);
    setResults(result.data);
    setHasVotes(result.data.some(r => r.votes > 0));
  };

  const createElection = async () => {
    try {
      await axios.post(`${API_BASE}/api/admin/elections`, {
        name: newElection,
        public_vote_time: newElectionTime || null,
      }, { headers });
      setNewElection('');
      setNewElectionTime('');
      refreshElections();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to create election';
      setError(msg);
    }
  };

  const deleteElection = async (id) => {
    if (confirm('Are you sure you want to delete this election?')) {
      try {
        await axios.delete(`${API_BASE}/api/admin/elections/${id}`, { headers });
        setSelectedElection(null);
        refreshElections();
      } catch {
        setError('Failed to delete election');
      }
    }
  };

  const toggleElectionOpen = async (id, isOpen) => {
    try {
      await axios.patch(`${API_BASE}/api/admin/elections/${id}`, { is_open: !isOpen }, { headers });
      refreshElections();
    } catch {
      setError('Failed to update election state');
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
      setError('Failed to add candidate');
    }
  };

  const deleteCandidate = async (id) => {
    if (confirm('Delete this candidate?')) {
      try {
        await axios.delete(`${API_BASE}/api/admin/candidates/${id}`, { headers });
        loadElectionDetails(selectedElection);
      } catch {
        setError('Failed to delete candidate');
      }
    }
  };

  const toggleEditCandidate = (index, editing) => {
    const updated = [...candidates];
    updated[index].editing = editing;
    if (!editing) updated[index].newName = updated[index].name;
    setCandidates(updated);
  };

  const saveEditCandidate = async (id, newName, index) => {
    if (!newName.trim()) return;
    try {
      await axios.patch(
        `${API_BASE}/api/admin/candidates/${id}`,
        { name: newName },
        { headers }
      );
      const updated = [...candidates];
      updated[index].editing = false;
      setCandidates(updated);
      loadElectionDetails(selectedElection);
    } catch {
      setError("Failed to update candidate");
    }
  };

  if (!isReady) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-8 bg-white/5 border border-white/10 rounded-xl shadow-lg">
        {/* LEFT */}
        <div className="space-y-6">
          <h2 className="text-3xl text-cyber font-bold text-center">Admin Dashboard</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {/* Create Election */}
          <section>
            <h3 className="text-xl mb-2">Create New Election</h3>
            <div className="space-y-2">
              <input type="text" value={newElection} onChange={e => setNewElection(e.target.value)}
                placeholder="Election name"
                className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/20" />
              <input type="datetime-local" value={newElectionTime} onChange={e => setNewElectionTime(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/20" />
              <button className="btn w-full mt-2" onClick={createElection}>Create</button>
            </div>
          </section>

          {/* Manage */}
          <section>
            <h3 className="text-xl mb-2">Manage Elections</h3>
            <div className="space-y-3">
              {elections.map((e) => (
                <div key={e.id} className="bg-white/10 p-3 rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <button className="text-left font-semibold hover:text-cyber flex-grow"
                      onClick={() => loadElectionDetails(e.id)}>
                      {e.name}
                    </button>
                    <label className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={e.is_open} onChange={() => toggleElectionOpen(e.id, e.is_open)} />
                      {e.is_open ? "Open" : "Closed"}
                    </label>
                    <button onClick={() => deleteElection(e.id)} className="btn bg-red-400 text-red-900">Delete</button>
                  </div>
                  <div className="text-sm text-white/50 mt-1">
                    Ends at: {e.public_vote_time ? new Date(e.public_vote_time).toLocaleString() : '—'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {selectedElection && (
            <>
              {/* Candidates */}
              <section>
                <h3 className="text-xl mb-2">Add Candidate</h3>
                <div className="flex gap-4">
                  <input type="text" value={newCandidate} onChange={e => setNewCandidate(e.target.value)}
                    placeholder="Candidate name" disabled={hasVotes}
                    className="flex-grow px-3 py-2 rounded bg-white/10 text-white border border-white/20 disabled:opacity-50" />
                  <button onClick={addCandidate} disabled={hasVotes} className="btn">Add</button>
                </div>
              </section>

              {/* Candidate list */}
              <section>
                <h3 className="text-xl mb-2">Candidates</h3>
                <ul className="space-y-2 text-gray-300">
                  {candidates.map((c, index) => (
                    <li key={c.id} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                      {!hasVotes && c.editing ? (
                        <input value={c.newName} onChange={e => {
                          const updated = [...candidates];
                          updated[index].newName = e.target.value;
                          setCandidates(updated);
                        }}
                          className="flex-grow mr-2 px-2 py-1 rounded bg-white/10 border border-white/20 text-white" />
                      ) : (
                        <span className="flex-grow text-white">{c.name}</span>
                      )}
                      <div className="flex gap-2">
                        {!hasVotes && c.editing ? (
                          <>
                            <button onClick={() => saveEditCandidate(c.id, c.newName, index)}
                              className="btn bg-green-400 text-green-900">Save</button>
                            <button onClick={() => toggleEditCandidate(index, false)}
                              className="btn bg-yellow-300 text-yellow-900">Cancel</button>
                          </>
                        ) : (
                          !hasVotes && (
                            <button onClick={() => toggleEditCandidate(index, true)}
                              className="btn bg-blue-400 text-blue-900">Edit</button>
                          )
                        )}
                        {!hasVotes && (
                          <button onClick={() => deleteCandidate(c.id)}
                            className="btn bg-red-400 text-red-900">Delete</button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Results */}
              <section>
                <h3 className="text-xl mb-2">Results</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {results.map((r, i) => (
                    <li key={i}>{r.candidate}: <strong>{r.votes}</strong> votes</li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
