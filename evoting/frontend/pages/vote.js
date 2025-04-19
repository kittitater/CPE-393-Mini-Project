import { useEffect, useState } from "react";
import { api, setAuth } from "../lib/api";

export default function Vote() {
  const [cands, setCands] = useState([]);
  const [receipt, setReceipt] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuth(token);
    api.get("/api/vote/candidates").then((r) => setCands(r.data));
  }, []);

  async function cast(id) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not logged");
    const res = await api.post("/api/vote/cast", null, {
      params: { candidate_id: id },
    });
    setReceipt(res.data.receipt);
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Vote</h1>
      {!receipt ? (
        <ul className="space-y-3">
          {cands.map((c) => (
            <li
              key={c.id}
              className="p-4 bg-white shadow flex justify-between rounded"
            >
              {c.name}
              <button
                onClick={() => cast(c.id)}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Select
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-2">Your Receipt</h2>
          <code className="block p-4 bg-gray-100 rounded text-lg">{receipt}</code>
        </>
      )}
    </div>
  );
}
