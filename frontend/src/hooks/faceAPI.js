// src/api/faceAPI.js
export const fetchFaces = async (query) => {
  // Normally here you'd call an API (e.g. axios.get('/api/faces', { params: query }))
  // For demo, simulate filtering
  const allFaces = [
    { id: 1, name: "John Doe", status: "Active" },
    { id: 2, name: "Jane Smith", status: "Inactive" },
    { id: 3, name: "Michael Johnson", status: "Active" },
    { id: 4, name: "Lisa Brown", status: "Inactive" },
    { id: 5, name: "Robert Wilson", status: "Active" },
  ];

  let filtered = [...allFaces];

  // 🔹 Apply filters from query
  if (query.status && query.status !== "all") {
    filtered = filtered.filter(
      (f) => f.status.toLowerCase() === query.status.toLowerCase()
    );
  }

  if (query.q) {
    filtered = filtered.filter((f) =>
      f.name.toLowerCase().includes(query.q.toLowerCase())
    );
  }

  await new Promise((r) => setTimeout(r, 300)); // simulate delay
  return filtered;
};
