import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { 
  FileText, Plus, Search, Edit3, X, 
  Check, Layout, Loader2 
} from 'lucide-react';

const ConfiguracionSistema = () => {
  const location = useLocation();
  const esVistaForm = location.pathname.includes('formularios');

  // El endpoint se ajusta según la URL del navegador
  const ENDPOINT = esVistaForm ? '/formularios' : '/documentos';

  // --- ESTADOS ---
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [itemEnEdicion, setItemEnEdicion] = useState(null);

  // --- 1. CARGAR DATOS DESDE LA API ---
  const obtenerDatos = async () => {
    try {
      setCargando(true);
      const respuesta = await clienteAxios.get(ENDPOINT);
      // Asumimos que la API devuelve un array. Si no hay backend, esto fallará al catch.
      setDatos(respuesta.data || []);
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      // Mantenemos datos vacíos o podrías poner los de ejemplo aquí para pruebas
      setDatos([]); 
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [ENDPOINT]); // Recarga si cambias entre documentos y formularios en el menú

  // --- 2. GUARDAR O ACTUALIZAR ---
  const guardarRegistro = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      nombre: formData.get('nombre'),
      tipo: formData.get('tipo'),
      estado: itemEnEdicion ? itemEnEdicion.estado : true
    };

    try {
      if (itemEnEdicion) {
        await clienteAxios.put(`${ENDPOINT}/${itemEnEdicion.id}`, payload);
      } else {
        await clienteAxios.post(ENDPOINT, payload);
      }
      obtenerDatos(); // Refrescar la tabla
      setMostrarModal(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("No se pudo conectar con el servidor para guardar.");
    }
  };

  // --- 3. CAMBIAR ESTADO ---
  const toggleEstado = async (id, estadoActual) => {
    try {
      await clienteAxios.patch(`${ENDPOINT}/${id}`, { estado: !estadoActual });
      setDatos(prev => prev.map(item => 
        item.id === id ? { ...item, estado: !estadoActual } : item
      ));
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  // --- FILTROS ---
  const datosFiltrados = useMemo(() => {
    return datos.filter(d => 
      (filtroActivo === 'Todos' || d.tipo === filtroActivo) &&
      d.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [datos, filtroActivo, busqueda]);

  // Pantalla de carga mientras responde el clienteAxios
  if (cargando) return (
    <div className="flex h-screen items-center justify-center bg-[#f8faf8]">
      <Loader2 className="animate-spin text-[#39a900]" size={40} />
    </div>
  );

  return (
    <div className="p-8 bg-[#f8faf8] min-h-screen font-sans">
      
      {/* Header Dinámico */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-[24px] font-black text-[#1e293b] tracking-tight">
            {esVistaForm ? 'Formularios Dinámicos' : 'Configuración de Requisitos'}
          </h1>
          <p className="text-[11px] font-bold text-[#39a900] uppercase tracking-[0.15em] mt-1">
            {esVistaForm ? 'Gestión de campos del sistema' : 'Documentación para solicitantes'}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar..."
            className="pl-11 pr-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] outline-none w-72 shadow-sm focus:border-[#39a900]/40 transition-all"
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Stats (Usando datos reales de la API) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total en DB" value={datos.length} icon={<FileText size={20} />} color="bg-green-50 text-green-600" />
        <StatCard label="Vista Actual" value={datosFiltrados.length} icon={<Layout size={20} />} color="bg-orange-50 text-orange-600" />
        <StatCard label="Activos" value={datos.filter(d => d.estado).length} icon={<Check size={20} />} color="bg-blue-50 text-blue-600" />
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
          {['Todos', 'Campesino', 'Asociacion'].map(f => (
            <button 
              key={f} 
              onClick={() => setFiltroActivo(f)}
              className={`px-6 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${filtroActivo === f ? 'bg-[#39a900] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <button 
          onClick={() => { setItemEnEdicion(null); setMostrarModal(true); }}
          className="bg-[#39a900] hover:bg-[#328700] text-white px-6 py-3 rounded-xl flex items-center gap-2.5 font-bold text-[12px] shadow-lg shadow-[#39a900]/20 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> AGREGAR NUEVO
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Tipo</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Estado</th>
              <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {datosFiltrados.length > 0 ? datosFiltrados.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-green-50 text-[#39a900] rounded-xl"><FileText size={18}/></div>
                    <p className="text-[14px] font-bold text-gray-700 leading-tight">{item.nombre}</p>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase ${item.tipo === 'Asociacion' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-700'}`}>
                    {item.tipo}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <button 
                    onClick={() => toggleEstado(item.id, item.estado)}
                    className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full transition-all ${item.estado ? 'text-[#39a900] bg-[#eaf6e5]' : 'text-gray-400 bg-gray-100'}`}
                  >
                    {item.estado ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => { setItemEnEdicion(item); setMostrarModal(true); }} className="p-2 text-gray-300 hover:text-[#39a900]">
                    <Edit3 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-medium">
                  {busqueda ? "No hay resultados para tu búsqueda." : "No hay datos disponibles en el servidor."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-gray-800">{itemEnEdicion ? 'Editar' : 'Crear'} Registro</h2>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400"><X size={20}/></button>
            </div>
            <form className="p-8 space-y-5" onSubmit={guardarRegistro}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
                <input name="nombre" required defaultValue={itemEnEdicion?.nombre} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#39a900]/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categoría</label>
                <select name="tipo" defaultValue={itemEnEdicion?.tipo || "Todos"} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] outline-none">
                  <option value="Todos">Todos</option>
                  <option value="Campesino">Campesino</option>
                  <option value="Asociacion">Asociación</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setMostrarModal(false)} className="px-5 py-2 text-[12px] font-bold text-gray-400">Cancelar</button>
                <button type="submit" className="bg-[#39a900] text-white px-8 py-3 rounded-xl font-bold text-[12px]">GUARDAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{label}</p>
      <p className="text-2xl font-black text-gray-800 mt-0.5">{value}</p>
    </div>
    <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
  </div>
);

export default ConfiguracionSistema;