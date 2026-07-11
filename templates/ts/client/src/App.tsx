import { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

function App() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold tracking-tight">__PROJECT_NAME__</h1>

      <section className="w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="rounded-lg border p-4">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
