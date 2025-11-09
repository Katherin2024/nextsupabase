"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [contenido, setContenido] = useState("");
  const [tweets, setTweets] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // 🧠 Cargar usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUsuario(JSON.parse(storedUser));
    }
  }, [router]);

  // 📦 Función: obtener tweets con likes y usuarios relacionados
  const obtenerTweets = async () => {
    const { data, error } = await supabase
      .from("tweets")
      .select(`
        id,
        contenido,
        created_at,
        user_id,
        usuarios(nombre),
        likes (user_id)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar tweets:", error.message);
    } else {
      setTweets(data || []);
    }
  };

  // 🔄 Suscripción en tiempo real a tweets y likes
  useEffect(() => {
    if (!usuario) return;

    obtenerTweets();

    // Escuchar cambios en la tabla "tweets"
    const tweetsSub = supabase
      .channel("realtime-tweets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tweets" },
        () => obtenerTweets()
      )
      .subscribe();

    // Escuchar cambios en la tabla "likes"
    const likesSub = supabase
      .channel("realtime-likes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        () => obtenerTweets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tweetsSub);
      supabase.removeChannel(likesSub);
    };
  }, [usuario]);

  // 📝 Publicar tweet
  const publicarTweet = async (e) => {
    e.preventDefault();

    if (!contenido.trim()) {
      setMensaje("⚠️ Escribe algo para publicar.");
      return;
    }

    const { error } = await supabase.from("tweets").insert([
      {
        user_id: usuario.id,
        contenido,
      },
    ]);

    if (error) {
      setMensaje("❌ Error al publicar tweet: " + error.message);
    } else {
      setContenido("");
      setMensaje("✅ Tweet publicado correctamente!");
    }
  };

  // ❤️ Dar o quitar like
  const toggleLike = async (tweetId, yaDioLike) => {
    if (!usuario) return;

    if (yaDioLike) {
      await supabase
        .from("likes")
        .delete()
        .eq("tweet_id", tweetId)
        .eq("user_id", usuario.id);
    } else {
      await supabase
        .from("likes")
        .insert([{ tweet_id: tweetId, user_id: usuario.id }]);
    }
  };

  // 🚪 Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  // 🧭 Ir al panel admin
  const irAlAdmin = () => {
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-lg mt-10 p-4 bg-white rounded-xl shadow-md">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">🐦 Twitter Clone</h1>
          <button
            onClick={cerrarSesion}
            className="text-sm text-red-500 underline"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Mostrar rol */}
        {usuario && (
          <p className="text-gray-500 mb-4 text-sm text-right">
            Sesión iniciada como: <strong>{usuario.rol}</strong>
          </p>
        )}

        {/* Botón solo para admin */}
        {usuario && usuario.rol === "admin" && (
          <div className="mb-4 text-right">
            <button
              onClick={irAlAdmin}
              className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500"
            >
              🛠️ Ir al Panel de Administración
            </button>
          </div>
        )}

        {/* Formulario para publicar */}
        <form onSubmit={publicarTweet} className="flex flex-col gap-3 mb-6">
          <textarea
            placeholder="¿Qué está pasando?"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            className="border p-2 rounded-lg resize-none"
            rows="3"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Twittear
          </button>
        </form>

        {/* Mostrar tweets */}
        <div className="flex flex-col gap-4">
          {tweets.length > 0 ? (
            tweets.map((t) => {
              const totalLikes = t.likes?.length || 0;
              const yaDioLike = t.likes?.some((l) => l.user_id === usuario?.id);

              return (
                <div
                  key={t.id}
                  className="border-b pb-3 hover:bg-gray-100 p-2 rounded-md"
                >
                  <span className="font-semibold text-blue-600">
                    @{t.usuarios?.nombre || "Usuario"}
                  </span>
                  <p className="mt-1">{t.contenido}</p>
                  <small className="text-gray-500">
                    {new Date(t.created_at).toLocaleString()}
                  </small>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => toggleLike(t.id, yaDioLike)}
                      className="text-red-500"
                    >
                      {yaDioLike ? "❤️" : "🤍"}
                    </button>
                    <span className="text-sm text-gray-600">
                      {totalLikes} {totalLikes === 1 ? "Like" : "Likes"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No hay tweets aún.</p>
          )}
        </div>

        {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
      </div>
    </div>
  );
}
