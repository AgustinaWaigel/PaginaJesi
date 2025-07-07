import React from 'react';

const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-32 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Cuidando tu salud con excelencia
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up">
            Hospital San José - Tu centro de salud de confianza
          </p>
          <button 
            onClick={() => scrollToSection('ubicacion')}
            className="btn-primary text-lg px-8 py-4"
          >
            Ver Ubicación
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
