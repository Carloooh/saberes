"use client"
import { useState } from 'react';

interface Asignatura {
  nombre: string;
  profesor: string;
  materiales: number;
}

interface Calificacion {
  asignatura: string;
  notas: number[];
}

interface AsistenciaDia {
  fecha: string;
  estado: 'Presente' | 'Ausente' | 'Justificado';
}

const asignaturas: Asignatura[] = [
  { nombre: 'Matemáticas', profesor: 'Prof. García', materiales: 3 },
  { nombre: 'Lengua', profesor: 'Prof. Martínez', materiales: 5 },
  { nombre: 'Historia', profesor: 'Prof. López', materiales: 2 },
  { nombre: 'Ciencias', profesor: 'Prof. Rodríguez', materiales: 4 }
];

const calificaciones: Calificacion[] = [
  { asignatura: 'Matemáticas', notas: [8.5, 7.8, 9.0] },
  { asignatura: 'Lengua', notas: [7.5, 8.0, 8.2] },
  { asignatura: 'Historia', notas: [9.0, 8.5, 8.8] },
  { asignatura: 'Ciencias', notas: [8.0, 8.5, 7.5] }
];

const asistencia: AsistenciaDia[] = [
  { fecha: '2023-12-15', estado: 'Presente' },
  { fecha: '2023-12-14', estado: 'Presente' },
  { fecha: '2023-12-13', estado: 'Justificado' },
  { fecha: '2023-12-12', estado: 'Presente' },
  { fecha: '2023-12-11', estado: 'Presente' },
  { fecha: '2023-12-10', estado: 'Presente' },
  { fecha: '2023-12-09', estado: 'Presente' },
  { fecha: '2023-12-08', estado: 'Presente' },
  { fecha: '2023-12-07', estado: 'Presente' },
  { fecha: '2023-12-06', estado: 'Presente' },
  { fecha: '2023-12-05', estado: 'Presente' },
  { fecha: '2023-12-04', estado: 'Presente' },
  { fecha: '2023-12-03', estado: 'Presente' },
  { fecha: '2023-12-02', estado: 'Presente' },
  { fecha: '2023-12-01', estado: 'Presente' },
  { fecha: '2023-11-30', estado: 'Presente' },
  { fecha: '2023-11-29', estado: 'Presente' },
  { fecha: '2023-11-28', estado: 'Presente' },
  { fecha: '2023-12-15', estado: 'Presente' },
  { fecha: '2023-12-14', estado: 'Presente' },
  { fecha: '2023-12-13', estado: 'Justificado' },
  { fecha: '2023-12-12', estado: 'Presente' }
];

const totalDias = asistencia.length;
const diasPresentes = asistencia.filter(dia => dia.estado === 'Presente').length;
const diasJustificados = asistencia.filter(dia => dia.estado === 'Justificado').length;
const diasAusentes = asistencia.filter(dia => dia.estado === 'Ausente').length;
const porcentajeAsistencia = ((diasPresentes + diasJustificados) / totalDias * 100).toFixed(1);

const calificacionesConPromedio = calificaciones.map(cal => ({
  ...cal,
  promedio: Number((cal.notas.reduce((a, b) => a + b, 0) / cal.notas.length).toFixed(2))
}));

const promedioTotal = Number((calificacionesConPromedio.reduce((sum, cal) => sum + cal.promedio, 0) / calificacionesConPromedio.length).toFixed(2));

const PortalAlumno = () => {
  const [filter, setFilter] = useState('all');

  const updateFilter = (selectedFilter: string) => {
    setFilter(currentFilter => currentFilter === selectedFilter ? 'all' : selectedFilter);
  };

  const filteredAsistencia = asistencia.filter(dia => filter === 'all' || dia.estado === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Portal del Alumno</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mis Asignaturas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {asignaturas.map((asignatura) => (
            <div className="bg-white p-4 rounded-lg shadow" key={asignatura.nombre}>
              <h3 className="font-semibold">{asignatura.nombre}</h3>
              <p className="text-sm text-gray-600">{asignatura.profesor}</p>
              <a
                href={`/portal-alumno/asignatura/${asignatura.nombre.toLowerCase()}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Ver material ({asignatura.materiales})
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Calificaciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Asignatura</th>
                <th className="p-2 text-left">Eval 1</th>
                <th className="p-2 text-left">Eval 2</th>
                <th className="p-2 text-left">Eval 3</th>
                <th className="p-2 text-left">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {calificacionesConPromedio.map((calificacion) => (
                <tr key={calificacion.asignatura}>
                  <td className="p-2 border-t">{calificacion.asignatura}</td>
                  {calificacion.notas.map((nota, index) => (
                    <td key={index} className="p-2 border-t">{nota}</td>
                  ))}
                  <td className="p-2 border-t font-semibold">{calificacion.promedio}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="p-2 border-t font-semibold" colSpan={4}>Promedio Total</td>
                <td className="p-2 border-t font-semibold">{promedioTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Asistencia</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <div className="bg-blue-100 p-4 rounded-lg cursor-pointer" onClick={() => updateFilter('all')}>
            <p className="text-sm text-blue-800">Asistencia Total</p>
            <p className="text-2xl font-bold text-blue-800">{porcentajeAsistencia}%</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg cursor-pointer" onClick={() => updateFilter('Presente')}>
            <p className="text-sm text-green-800">Días Presentes</p>
            <p className="text-2xl font-bold text-green-800">{diasPresentes}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg cursor-pointer" onClick={() => updateFilter('Justificado')}>
            <p className="text-sm text-yellow-800">Faltas Justificadas</p>
            <p className="text-2xl font-bold text-yellow-800">{diasJustificados}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg cursor-pointer" onClick={() => updateFilter('Ausente')}>
            <p className="text-sm text-red-800">Faltas Injustificadas</p>
            <p className="text-2xl font-bold text-red-800">{diasAusentes}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsistencia.slice(-10).reverse().map((dia, index) => (
                  <tr key={index} data-estado={dia.estado}>
                    <td className="p-2 border-t">{dia.fecha}</td>
                    <td className="p-2 border-t">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          dia.estado === 'Presente'
                            ? 'bg-green-200 text-green-800'
                            : dia.estado === 'Justificado'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {dia.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalAlumno;