import React from 'react';

const Header: React.FC = () => {
  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🏥</span>
            <h1 className="text-2xl font-bold">Hospital San José</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="hover:text-blue-200 transition-colors duration-300 font-medium"
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('servicios')}
              className="hover:text-blue-200 transition-colors duration-300 font-medium"
            >
              Servicios
            </button>
            <button 
              onClick={() => scrollToSection('ubicacion')}
              className="hover:text-blue-200 transition-colors duration-300 font-medium"
            >
              Ubicación
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className="hover:text-blue-200 transition-colors duration-300 font-medium"
            >
              Contacto
            </button>
          </nav>
          {/* Mobile menu button */}
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
