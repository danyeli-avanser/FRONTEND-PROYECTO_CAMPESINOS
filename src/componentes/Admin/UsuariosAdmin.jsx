import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, UserPlus } from "lucide-react";
import { listUsers, createUser, activarUser, desactivarUser } from "../../api/adminUsers";

const ROLES = [
  { value: "ADMIN", label: "ADMIN" },
  { value: "GESTOR", label: "GESTOR" },
  { value: "CAMPESINO", label: "CAMPESINO" },
  { value: "ASOCIACION", label: "ASOCIACION" },
];

export default function UsuariosAdmin() {
  // listado
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ count: 0, next: null, previous: null, results: [] });
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  // filtros UI
  const [q, setQ] = useState("");

  // modal crear
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "CAMPESINO",
    first_name: "",
    last_name: "",
    phone: "",
    document_id: "",
    is_active: true,
  });

  const load = async (p = 1) => {
    setError("");
    setLoading(true);
    try {
      const res = await listUsers(p);
      setData(res);
      setPage(p);
    } catch (e) {
      setError(e?.response?.data?.detail || "No se pudo cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data.results || [];
    return (data.results || []).filter((u) => {
      const haystack = `${u.id} ${u.email} ${u.role} ${u.first_name || ""} ${u.last_name || ""} ${u.document_id || ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [data, q]);

  const toggleActive = async (u) => {
    try {
      if (u.is_active) await desactivarUser(u.id);
      else await activarUser(u.id);
      await load(page);
    } catch (e) {
      alert(e?.response?.data?.detail || "No se pudo actualizar el usuario.");
    }
  };

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      role: "CAMPESINO",
      first_name: "",
      last_name: "",
      phone: "",
      document_id: "",
      is_active: true,
    });
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      // OJO: el serializer del backend espera estos nombres
      await createUser({
        email: form.email,
        password: form.password,
        role: form.role,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        document_id: form.document_id,
        is_active: form.is_active,
      });

      setOpen(false);
      resetForm();
      await load(1);
    } catch (e2) {
      // DRF suele devolver {field: ["error"]} o detail
      const payload = e2?.response?.data;
      const msg =
        payload?.detail ||
        (payload && typeof payload === "object"
          ? Object.entries(payload)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
              .join(" | ")
          : "No se pudo crear el usuario.");
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 bg-[#f8faf8] min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Usuarios</h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Crear y administrar usuarios del sistema
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#39a900] text-white font-black text-[12px] shadow-sm hover:bg-[#2e8800] active:scale-[0.98]"
        >
          <UserPlus size={18} />
          Crear usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-300" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por email, rol, nombre o documento..."
            className="w-full pl-9 pr-4 py-2 bg-[#f8faf8] rounded-xl text-[11px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#39a900]"
          />
        </div>

        <div className="text-[11px] font-black text-gray-400">
          Total: <span className="text-gray-700">{data.count}</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {error && (
          <div className="p-5 text-[11px] font-bold text-red-500 border-b border-gray-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-gray-400 font-bold text-sm">Cargando...</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="p-5">ID</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Nombre</th>
                  <th className="p-5">Rol</th>
                  <th className="p-5">Documento</th>
                  <th className="p-5">Activo</th>
                  <th className="p-5 text-right">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="p-5 text-[11px] font-black text-gray-800">{u.id}</td>
                    <td className="p-5 text-[11px] font-bold text-gray-700">{u.email}</td>
                    <td className="p-5 text-[11px] font-bold text-gray-700">
                      {(u.first_name || "") + " " + (u.last_name || "")}
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 rounded-full border text-[10px] font-black bg-white text-gray-700 border-gray-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5 text-[11px] font-bold text-gray-500">{u.document_id || "-"}</td>
                    <td className="p-5">
                      <span className={`text-[11px] font-black ${u.is_active ? "text-[#39a900]" : "text-red-500"}`}>
                        {u.is_active ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`px-4 py-2 rounded-xl text-[11px] font-black border transition active:scale-[0.98]
                          ${u.is_active
                            ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                            : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                          }`}
                      >
                        {u.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400 font-bold text-sm">
                      No hay usuarios para ese filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="p-5 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                Página {page}
              </p>

              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 disabled:opacity-50"
                  disabled={!data.previous}
                  onClick={() => load(page - 1)}
                >
                  Anterior
                </button>

                <button
                  className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-800 disabled:opacity-50"
                  disabled={!data.next}
                  onClick={() => load(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal crear */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[999]">
          <div className="w-full max-w-lg bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-gray-400" />
                <h3 className="text-sm font-black text-gray-800">Crear usuario</h3>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  setCreateError("");
                }}
                className="text-gray-400 font-black hover:text-gray-700"
              >
                X
              </button>
            </div>

            <form onSubmit={onCreate} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-[11px] rounded">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm((s) => ({ ...s, email: v }))}
                  required
                  type="email"
                />

                <Input
                  label="Contraseña"
                  value={form.password}
                  onChange={(v) => setForm((s) => ({ ...s, password: v }))}
                  required
                  type="password"
                />

                <Select
                  label="Rol"
                  value={form.role}
                  onChange={(v) => setForm((s) => ({ ...s, role: v }))}
                  options={ROLES}
                />

                <Input
                  label="Documento (document_id)"
                  value={form.document_id}
                  onChange={(v) => setForm((s) => ({ ...s, document_id: v }))}
                  placeholder="CC:1001 o NIT:9001 (ejemplo)"
                />

                <Input
                  label="Nombres"
                  value={form.first_name}
                  onChange={(v) => setForm((s) => ({ ...s, first_name: v }))}
                />

                <Input
                  label="Apellidos"
                  value={form.last_name}
                  onChange={(v) => setForm((s) => ({ ...s, last_name: v }))}
                />

                <Input
                  label="Teléfono"
                  value={form.phone}
                  onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
                />

                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-[11px] font-black text-gray-600">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
                    />
                    Activo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setCreateError("");
                  }}
                  className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-600 font-black text-[12px] hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-3 rounded-2xl bg-[#39a900] text-white font-black text-[12px] shadow-sm hover:bg-[#2e8800] disabled:opacity-70 active:scale-[0.98]"
                >
                  {creating ? "Creando..." : "Crear"}
                </button>
              </div>

              <p className="text-[10px] text-gray-400 font-bold mt-2">
                Nota: tu login usa document_type + document_number. Si tu backend valida con <b>document_id</b>,
                usa un formato consistente (por ejemplo <b>CC:1001</b> o <b>NIT:9001</b>).
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, required, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-[11px] font-black text-gray-600 mb-2">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#39a900]"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[11px] font-black text-gray-600 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#39a900] bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
