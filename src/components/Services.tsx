import React from 'react';

interface Service {
  icon: string;
  title: string;
  description: string;
}

const Services: React.FC = () => {
  const services: Service[] = [
    {
      icon: '🚑',
      title: 'Emergencias 24/7',
      description: 'Atención médica de urgencia las 24 horas del día'
    },
    {
      icon: '🔬',
      title: 'Laboratorio',
      description: 'Análisis clínicos y estudios especializados'
    },
    {
      icon: '🏥',
      title: 'Hospitalización',
      description: 'Habitaciones cómodas y atención personalizada'
    },
    {
      icon: '👨‍⚕️',
      title: 'Consultas Médicas',
      description: 'Especialistas en diversas áreas médicas'
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Nuestros Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service: Service, index: number) => (
            <div key={index} className="card text-center">
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
