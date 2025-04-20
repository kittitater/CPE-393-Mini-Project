
// frontend/pages/vote.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const Vote = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get('/api/vote/elections', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setElections(response.data);
      } catch (err) {
        setError('Failed to load elections. Please log in again.');
        router.push('/login');
      }
    };
    fetchElections();
  }, [router]);

  const handleElectionSelect = async (electionId) => {
    setSelectedElection(electionId);
    try {
      const response = await axios.get(`/api/vote/candidates?election_id=${electionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCandidates(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load candidates.');
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate.');
      return;
    }
    try {
      const response = await axios.post(
        '/api/vote/cast',
        { candidate_id: selectedCandidate },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReceipt(response.data.receipt);
      setError('');
    } catch (err) {
      setError('Failed to cast vote. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Cast Your Vote</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!selectedElection ? (
          <div>
            <h3 className="text-xl mb-4 font-medium">Select an Election</h3>
            <ul className="space-y-3">
              {elections.map((election) => (
                <li key={election.id}>
                  <button
                    onClick={() => handleElectionSelect(election.id)}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    {election.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : !receipt ? (
          <div>
            <h3 className="text-xl mb-4 font-medium">Select a Candidate</h3>
            <ul className="space-y-3">
              {candidates.map((candidate) => (
                <li key={candidate.id} className="flex items-center">
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    onChange={() => setSelectedCandidate(candidate.id)}
                    className="mr-2"
                    aria-label={`Select ${candidate.name}`}
                  />
                  <span>{candidate.name}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleVote}
              className="w-full bg-green-500 text-white py-2 rounded-lg mt-6 hover:bg-green-600 transition"
            >
              Cast Vote
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl mb-4 font-medium text-green-600">Vote Cast Successfully</h3>
            <p className="text-gray-700">Your receipt: <strong>{receipt}</strong></p>
            <p className="text-gray-600 mt-2">Save this receipt to verify your vote later.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Vote;






// Old files not use



// import { useEffect, useState } from "react";
// import { api, setAuth } from "../lib/api";

// export default function Vote() {
//   const [cands, setCands] = useState([]);
//   const [receipt, setReceipt] = useState("");
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) setAuth(token);
//     api.get("/api/vote/candidates").then((r) => setCands(r.data));
//   }, []);

//   async function cast(id) {
//     const token = localStorage.getItem("token");
//     if (!token) return alert("Not logged");
//     const res = await api.post("/api/vote/cast", null, {
//       params: { candidate_id: id },
//     });
//     setReceipt(res.data.receipt);
//   }

//   return (
//     <div className="max-w-xl mx-auto p-8">
//       <h1 className="text-2xl font-bold mb-6">Vote</h1>
//       {!receipt ? (
//         <ul className="space-y-3">
//           {cands.map((c) => (
//             <li
//               key={c.id}
//               className="p-4 bg-white shadow flex justify-between rounded"
//             >
//               {c.name}
//               <button
//                 onClick={() => cast(c.id)}
//                 className="bg-blue-600 text-white px-4 py-1 rounded"
//               >
//                 Select
//               </button>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <>
//           <h2 className="text-lg font-semibold mb-2">Your Receipt</h2>
//           <code className="block p-4 bg-gray-100 rounded text-lg">{receipt}</code>
//         </>
//       )}
//     </div>
//   );
// }