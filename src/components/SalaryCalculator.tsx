'use client';

export default function SalaryCalculator() {
  return (
    <div className="bg-gradient-to-br from-pastel-peach via-nursing-50 to-pastel-lavender rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-nursing-200 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Icon Section */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-nursing-400 to-nursing-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl sm:text-4xl">💶</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-nursing-800 mb-2 flex items-center justify-center sm:justify-start gap-2">
            <span>Calculadora de Salario Neto</span>
          </h3>
          <p className="text-sm sm:text-base text-gray-700 mb-4">
            Descubre cuál será tu salario neto como enfermero/a residente. 
            Calcula tu sueldo después de impuestos y cotizaciones sociales.
          </p>

          {/* Button */}
          <a
            href="https://finanzly.es/es/tools/net-salary"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-nursing-500 to-nursing-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-nursing-600 hover:to-nursing-700 transition-all duration-300 transform hover:scale-105"
          >
            <span>Calcular mi salario</span>
            <span className="text-xl">→</span>
          </a>
        </div>

        {/* Decorative elements */}
        <div className="hidden lg:flex flex-col gap-2 text-2xl opacity-50">
          <span>📊</span>
          <span>💰</span>
          <span>📈</span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-nursing-300">
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>✓</span>
            <span>Cálculo actualizado</span>
          </div>
          <div className="flex items-center gap-1">
            <span>✓</span>
            <span>Datos fiscales oficiales</span>
          </div>
          <div className="flex items-center gap-1">
            <span>✓</span>
            <span>Gratuito y fácil de usar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
