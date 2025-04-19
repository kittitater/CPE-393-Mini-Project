import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import Link from "next/link";

export default function ElectionsPage() {
  const qc = useQueryClient();
  const { data: elections = [] } = useQuery(["elections"], () =>
    api.get("/api/admin/elections").then((r) => r.data)
  );

  const createElection = useMutation(
    (name) => api.post("/api/admin/elections", { name }).then((r) => r.data),
    { onSuccess: () => qc.invalidateQueries(["elections"]) }
  );

  const toggleElection = useMutation(
    ({ id, is_open }) =>
      api
        .patch(`/api/admin/elections/${id}`, { is_open })
        .then((r) => r.data),
    { onSuccess: () => qc.invalidateQueries(["elections"]) }
  );

  const [name, setName] = useState("");

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Elections</h1>

      <div className="flex gap-3 mb-8">
        <input
          className="border p-2 flex-1"
          placeholder="New election name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            if (name.trim()) createElection.mutate(name), setName("");
          }}
        >
          Create
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {elections.map((el) => (
            <tr key={el.id} className="border-b">
              <td className="p-3">{el.name}</td>
              <td className="p-3">
                {el.is_open ? (
                  <span className="text-green-600">Open</span>
                ) : (
                  <span className="text-red-600">Closed</span>
                )}
              </td>
              <td className="p-3 flex gap-2">
                <button
                  className="px-2 py-1 bg-indigo-600 text-white rounded"
                  onClick={() =>
                    toggleElection.mutate({ id: el.id, is_open: !el.is_open })
                  }
                >
                  {el.is_open ? "Close" : "Open"}
                </button>
                <Link
                  href={`/admin/election/${el.id}`}
                  className="px-2 py-1 bg-gray-800 text-white rounded"
                >
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
