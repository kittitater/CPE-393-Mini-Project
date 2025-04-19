import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import AdminLayout from "../../../components/AdminLayout";
import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

export default function ElectionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const qc = useQueryClient();
  const { data: candidates = [] } = useQuery(
    ["cands", id],
    () =>
      api
        .get("/api/admin/candidates", { params: { election_id: id } })
        .then((r) => r.data),
    { enabled: !!id }
  );
  const { data: results = [] } = useQuery(
    ["results", id],
    () =>
      api
        .get("/api/admin/results", { params: { election_id: id } })
        .then((r) => r.data),
    { enabled: !!id, refetchInterval: 4000 }
  );

  const addCand = useMutation(
    (name) =>
      api
        .post("/api/admin/candidates", { election_id: id, name })
        .then((r) => r.data),
    { onSuccess: () => qc.invalidateQueries(["cands", id]) }
  );

  const deleteCand = useMutation(
    (cid) => api.delete(`/api/admin/candidates/${cid}`),
    { onSuccess: () => qc.invalidateQueries(["cands", id]) }
  );

  const [newName, setNewName] = useState("");

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Election #{id}</h1>

      {/* Candidate CRUD */}
      <div className="mb-10">
        <h2 className="font-semibold mb-2">Candidates</h2>
        <div className="flex gap-3 mb-4">
          <input
            className="border p-2 flex-1"
            placeholder="New candidate name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              if (newName.trim()) addCand.mutate(newName), setNewName("");
            }}
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {candidates.map((c) => (
            <li
              key={c.id}
              className="flex justify-between bg-white p-3 rounded shadow"
            >
              {c.name}
              <button
                className="text-red-600"
                onClick={() => deleteCand.mutate(c.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Results Pie Chart */}
      <h2 className="font-semibold mb-4">Live Results</h2>
      {results.length ? (
        <div className="w-96">
          <Pie
            data={{
              labels: results.map((r) => r.candidate),
              datasets: [
                { data: results.map((r) => r.votes), borderWidth: 1 },
              ],
            }}
            options={{ plugins: { legend: { position: "right" } } }}
          />
        </div>
      ) : (
        <p>No votes yet.</p>
      )}
    </AdminLayout>
  );
}
