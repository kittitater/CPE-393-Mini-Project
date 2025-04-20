// frontend/pages/admin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const Admin = () => {
  const [elections, setElections] = useState([]);
  const [newElectionName, setNewElectionName] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get('/api/admin/elections', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setElections(response.data);
      } catch (err) {
        setError('Failed to load elections. Ensure you have admin access.');
      }
    };
    fetchElections();
  }, []);

  const handleCreateElection = async () => {
    try {
      await axios.post(
        '/api/admin/elections',
        { name: newElectionName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setNewElectionName('');
      const response = await axios.get('/api/admin/elections', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setElections(response.data);
      setError('');
    } catch (err) {
      setError('Failed to create election.');
    }
  };

  const handleSelectElection = async (electionId) => {
    setSelectedElection(electionId);
    try {
      const [candidatesResponse, resultsResponse] = await Promise.all([
        axios.get(`/api/admin/candidates?election_id=${electionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get(`/api/admin/results?election_id=${electionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      setCandidates(candidatesResponse.data);
      setResults(resultsResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to load election data.');
    }
  };

  const handleAddCandidate = async () => {
    try {
      await axios.post(
        '/api/admin/candidates',
        { name: newCandidateName, election_id: selectedElection },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setNewCandidateName('');
      const response = await axios.get(`/api/admin/candidates?election_id=${selectedElection}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCandidates(response.data);
      setError('');
    } catch (err) {
      setError('Failed to add candidate.');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <section className="mb-8">
          <h3 className="text-xl mb-4 font-medium">Create New Election</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={newElectionName}
              onChange={(e) => setNewElectionName(e.target.value)}
              className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Election Name"
              aria-label="New Election Name"
            />
            <button
              onClick={handleCreateElection}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Create
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h3 className="text-xl mb-4 font-medium">Select Election</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {elections.map((election) => (
              <li key={election.id}>
                <button
                  onClick={() => handleSelectElection(election.id)}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  {election.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
        {selectedElection && (
          <div className="space-y-8">
            <section>
              <h3 className="text-xl mb-4 font-medium">Add Candidate</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Candidate Name"
                  aria-label="New Candidate Name"
                />
                <button
                  onClick={handleAddCandidate}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Add
                </button>
              </div>
            </section>
            <section>
              <h3 className="text-xl mb-4 font-medium">Candidates</h3>
              <ul className="space-y-2">
                {candidates.map((candidate) => (
                  <li key={candidate.id} className="text-gray-700">{candidate.name}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="text-xl mb-4 font-medium">Results</h3>
              <ul className="space-y-2">
                {results.map((result, index) => (
                  <li key={index} className="text-gray-700">
                    {result.candidate}: <strong>{result.votes}</strong> votes
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;