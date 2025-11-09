"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // 🔐 Verificar rol del usuario
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      router.push("/login");
    } else {
      const user = JSON.parse(storedUser);
      setUsuario(user);
      if (user.rol !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [router]);

  // 📥 Cargar tweets y usuarios
  useEffect(() => {
    if (usuario?.rol === "admin") {
      cargarTweets();
      cargarUsuarios();
    }
  }, [usuario]);

  const cargarTweets = async () => {
    const { data, error } = await supabase
      .from("tweets")
      .select("id, contenido, created_at, usuarios(nombre)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMensaje("Error al cargar tweets.");
    } else {
      setTweets(data || []);
    }
  };

  const cargarUsuarios = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, correo, rol");
    if (error) {
      console.error(error);
    } else {
      setUsuarios(data || []);
    }
  };

  // 🗑️ Eliminar tweet
  const eliminarTweet = async (id) => {
    const { error } = await supabase.from("tweets").delete().eq("id", id);
    if (error) {
      alert("Error al eliminar tweet: " + error.message);
    } else {
      alert("Tweet eliminado ✅");
      cargarTweets();
    }
  };

  // 🚪 Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-5xl mt-10 p-6 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">🛠️ Panel de Administración</h1>
          <button
            onClick={cerrarSesion}
            className="text-sm text-red-500 underline"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Sección de usuarios */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">👥 Usuarios registrados</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Correo</th>
                <th className="border p-2">Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="border p-2">{u.nombre}</td>
                  <td className="border p-2">{u.correo}</td>
                  <td className="border p-2">{u.rol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Sección de tweets */}
        <section>
          <h2 className="text-xl font-semibold mb-3">🐦 Tweets publicados</h2>
          {tweets.map((t) => (
            <div
              key={t.id}
              className="border-b pb-3 mb-3 hover:bg-gray-100 p-2 rounded-md flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-blue-600">
                  @{t.usuarios?.nombre || "Usuario"}
                </p>
                <p>{t.contenido}</p>
                <small className="text-gray-500">
                  {new Date(t.created_at).toLocaleString()}
                </small>
              </div>
              <button
                onClick={() => eliminarTweet(t.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          ))}
        </section>

        {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
      </div>
    </div>
  );
}
