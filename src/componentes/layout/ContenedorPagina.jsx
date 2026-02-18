import React from 'react';
import { Outlet } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';
import BarraLateral from './BarraLateral';
import BarraNavegacion from './BarraNavegacion';

const ContenedorPagina = ({ notificaciones }) => {
  return (
    <div className="flex h-screen bg-[#f8faf8] overflow-hidden">
      {/* 1. Menú lateral fijo */}
      <BarraLateral />

      {/* 2. Contenido derecho con scroll independiente */}
      <div className="flex-1 ml-64 flex flex-col h-full overflow-y-auto">
        
        <BarraNavegacion notificaciones={notificaciones} />
        
        {/* Main crece para ocupar el espacio y empujar el footer al fondo */}
        <main className="flex-1 px-8 py-4">
          <Outlet /> 
        </main>

        {/* 3. PIE DE PÁGINA (Compacto, fiel a la imagen y funcional) */}
        <footer className="w-full bg-white mt-auto">
          <div className="px-10 py-3 flex flex-row justify-between items-center border-t border-gray-100">
            
            {/* Lado Izquierdo: Redes Sociales */}
            <div className="flex flex-col">
              <div className="flex gap-3 text-gray-400">
                <a href="https://www.instagram.com/senacomunica/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                  <Instagram size={14} strokeWidth={1.5} />
                </a>
                <a href="https://web.facebook.com/SENA/?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                  <Facebook size={14} strokeWidth={1.5} />
                </a>
                <a href="https://x.com/SENAComunica" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                  <Twitter size={14} strokeWidth={1.5} />
                </a>
                <a href="https://www.youtube.com/user/SENATV" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                  <Youtube size={14} strokeWidth={1.5} />
                </a>
                <a href="https://www.linkedin.com/school/servicio-nacional-de-aprendizaje-sena-/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
                  <Linkedin size={14} strokeWidth={1.5} />
                </a>
              </div>
              
              {/* @SENAcomunica Funcional */}
              <a 
                href="https://twitter.com/SENAComunica" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 font-bold text-xs tracking-tight mt-0.5 hover:text-[#39a900] transition-colors inline-block w-fit"
              >
                @SENAcomunica
              </a>
            </div>

            {/* Lado Derecho: URL Institucional */}
            <div>
              <a 
                href="https://www.sena.edu.co" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#39a900] font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
              >
                www.sena.edu.co
              </a>
            </div>
          </div>

          {/* Franja verde final súper delgada */}
          <div className="bg-[#052e16] py-1.5">
             <p className="text-center text-[8px] text-white/90 font-bold uppercase tracking-[0.3em]">
               CAMPESENA • 2026
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ContenedorPagina;