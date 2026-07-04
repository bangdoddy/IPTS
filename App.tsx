// src/App.tsx
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { authUserOrNull } from "./libs/auth";

export default function App() {
  // projects tetap dari App (sesuai kebutuhan kamu)
  const [projects, setProjects] = useState<any[]>([]);

  // optional: kalau beberapa component butuh user di App-level (mis. header global),
  // kamu bisa simpan ini. Kalau gak perlu, boleh hapus semua state user ini.
  const [user, setUser] = useState(() => authUserOrNull());

  useEffect(() => {
    // refresh user saat tab balik fokus (berguna setelah login/otp)
    const sync = () => setUser(authUserOrNull());
    window.addEventListener("focus", sync);

    // kalau kamu pernah set auth lewat localStorage (opsional), ini juga kepake
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* ✅ versi baru: AppRoutes tidak perlu props user */}
        <AppRoutes projects={projects} setProjects={setProjects} />
      </div>
    </ThemeProvider>
  );
}
