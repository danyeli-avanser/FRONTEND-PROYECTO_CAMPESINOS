import React, { useState } from 'react';
import { 
  Plus, Search, FileText, ChevronDown, ChevronUp,
  Settings2, CheckCircle2, X
} from 'lucide-react';

const FormulariosDinamicos = () => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [formularioExpandido, setFormularioExpandido] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const formulariosIniciales = [
    { id: 1, nombre: 'Datos del Solicitante', desc: 'Informacion personal del campesino o representante', estado: 'Activo', tipo: 'Todos', campos: '7 campos', detalles: ['Nombre Completo', 'Cédula', 'Fecha de Nacimiento', 'Género', 'Etnia', 'Discapacidad', 'Ubicación'] },
    { id: 2, nombre: 'Datos Productivos', desc: 'Informacion sobre la actividad productiva del solicitante', estado: 'Activo', tipo: 'Todos', campos: '4 campos', detalles: ['Tipo de Cultivo', 'Hectáreas', 'Propiedad de tierra', 'Asistencia técnica'] },
    { id: 3, nombre: 'Solicitud de Capacitacion', desc: 'Campos especificos para solicitudes de capacitacion tecnica', estado: 'Activo', tipo: 'Capacitacion', campos: '5 campos', detalles: ['Área de interés', 'Nivel de estudios', 'Horario disponible', 'Experiencia previa', 'Certificaciones'] },
    { id: 4, nombre: 'Proyecto Productivo', desc: 'Campos especificos para registro de proyectos productivos', estado: 'Activo', tipo: 'Proyecto', campos: '5 campos', detalles: ['Nombre del proyecto', 'Presupuesto estimado', 'Duración', 'Aliados', 'Impacto social'] }
  ];

  // Lógica de filtrado
  const formulariosFiltrados = formulariosIniciales.filter(f => {
    const coincideBusqueda = f.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtroActivo === 'Todos' || f.tipo === filtroActivo;
    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen relative">
      {/* Header Superior */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Formularios Dinámicos</h1>
          <p className="text-xs text-gray-400">Configura los campos de los formularios del sistema</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar formulario..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-64 outline-none focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard value={formulariosIniciales.length} label="Formularios" icon={<FileText className="text-green-600" size={24} />} />
        <StatCard value="21" label="Campos totales" icon={<Settings2 className="text-orange-400" size={24} />} />
        <StatCard value="4" label="Formularios activos" icon={<CheckCircle2 className="text-green-500" size={24} />} />
      </div>

      {/* Filtros y Botón */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {['Todos', 'Capacitacion', 'Proyecto'].map(f => (
            <button 
              key={f}
              onClick={() => setFiltroActivo(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filtroActivo === f ? 'bg-gray-100 text-gray-800 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#39a900] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-[#2d8500] transition-colors shadow-lg active:scale-95"
        >
          <Plus size={18} /> Nuevo Formulario
        </button>
      </div>

      {/* Lista de Formularios con Acordeón */}
      <div className="space-y-3">
        {formulariosFiltrados.map((form) => (
          <div key={form.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div 
              onClick={() => setFormularioExpandido(formularioExpandido === form.id ? null : form.id)}
              className="p-4 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-700 text-sm">{form.nombre}</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-md uppercase">Activo</span>
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-md">{form.tipo}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{form.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400">{form.campos}</span>
                {formularioExpandido === form.id ? <ChevronUp size={18} className="text-green-500" /> : <ChevronDown size={18} className="text-gray-300" />}
              </div>
            </div>

            {/* Contenido Expandible (Detalles del Formulario) */}
            {formularioExpandido === form.id && (
              <div className="px-16 pb-6 pt-2 border-t border-gray-50 bg-gray-50/50 animate-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Campos Configurados:</p>
                <div className="flex flex-wrap gap-2">
                  {form.detalles.map((campo, idx) => (
                    <span key={idx} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {campo}
                    </span>
                  ))}
                  <button className="text-[#39a900] text-xs font-bold hover:underline ml-2">+ Editar campos</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {formulariosFiltrados.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm italic">No se encontraron formularios con esa búsqueda.</p>
          </div>
        )}
      </div>

      {/* MODAL PARA NUEVO FORMULARIO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Crear Nuevo Formulario</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Nombre del Formulario</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-green-500" placeholder="Ej: Datos Socioeconómicos" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Categoría</label>
                <select className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-green-500">
                  <option>Seleccionar...</option>
                  <option>Capacitación</option>
                  <option>Proyecto</option>
                  <option>General</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-[#39a900] text-white py-2 rounded-lg text-sm font-bold shadow-md">Crear Formulario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ value, label, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex items-center gap-5">
    <div className="p-4 bg-gray-50 rounded-xl">{icon}</div>
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-gray-800">{value}</span>
      </div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default FormulariosDinamicos;