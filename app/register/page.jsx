"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!nombre || !correo || !contrasena) {
      setMensaje("⚠️ Todos los campos son obligatorios");
      return;
    }

    // 1️⃣ Registrar usuario en la tabla "usuarios"
    const { data, error } = await supabase.from("usuarios").insert([
      {
        nombre,
        correo,
        contrasena,
        rol: "usuario",
      },
    ]);

    if (error) {
      setMensaje("❌ Error al registrar: " + error.message);
    } else {
      setMensaje("✅ Registro exitoso, ahora puedes iniciar sesión");
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Crear cuenta
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="p-2 border rounded-lg"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="p-2 border rounded-lg"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="p-2 border rounded-lg"
          />

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Registrarse
          </button>
        </form>

        {mensaje && <p className="mt-4 text-center">{mensaje}</p>}

        <p className="mt-6 text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-500 cursor-pointer underline"
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}
