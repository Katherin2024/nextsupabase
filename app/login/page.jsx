"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!correo || !contrasena) {
      setMensaje("⚠️ Debes llenar todos los campos");
      return;
    }

    // 1️⃣ Buscar usuario en la tabla 'usuarios'
    const { data: usuarios, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", correo)
      .eq("contrasena", contrasena)
      .single();

    if (error || !usuarios) {
      setMensaje("❌ Usuario o contraseña incorrectos");
      return;
    }

    // 2️⃣ Guardar sesión en localStorage (temporal)
    localStorage.setItem("usuario", JSON.stringify(usuarios));

    // 3️⃣ Redirigir al dashboard o página principal
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Iniciar sesión
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            Entrar
          </button>
        </form>

        {mensaje && <p className="mt-4 text-center">{mensaje}</p>}

        <p className="mt-6 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-blue-500 cursor-pointer underline"
          >
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  );
}
