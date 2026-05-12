export function AsistenciaManager() {

  const personal = [
    {
      nombre: 'Dr. Carlos Mendoza',
      cargo: 'Veterinario',
      estado: 'Presente',
      ingreso: '08:00',
    },
    {
      nombre: 'Ana López',
      cargo: 'Recepción',
      estado: 'Tardanza',
      ingreso: '08:25',
    },
    {
      nombre: 'Luis Fernández',
      cargo: 'Farmacia',
      estado: 'Ausente',
      ingreso: '--',
    },
    {
      nombre: 'María Torres',
      cargo: 'Peluquería',
      estado: 'Presente',
      ingreso: '07:55',
    },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Asistencia del Personal
        </h1>

        <p className="text-gray-500 mt-1">
          Control diario de personal y turnos
        </p>
      </div>

      {/* KPIs */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-sm text-gray-500">
            Personal Total
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            12
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-sm text-gray-500">
            Presentes
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            9
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-sm text-gray-500">
            Tardanzas
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-2">
            2
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-sm text-gray-500">
            Ausencias
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            1
          </h2>
        </div>

      </div>

      {/* TABLA */}

      <div className="bg-white rounded-2xl shadow border">

        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            Registro Diario
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left p-4">
                  Personal
                </th>

                <th className="text-left p-4">
                  Cargo
                </th>

                <th className="text-left p-4">
                  Estado
                </th>

                <th className="text-left p-4">
                  Hora Ingreso
                </th>

              </tr>

            </thead>

            <tbody>

              {personal.map((item, index) => (

                <tr
                  key={index}
                  className="border-t"
                >

                  <td className="p-4 font-medium">
                    {item.nombre}
                  </td>

                  <td className="p-4">
                    {item.cargo}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                          item.estado === 'Presente'
                            ? 'bg-green-100 text-green-700'
                            : item.estado === 'Tardanza'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }
                      `}
                    >
                      {item.estado}
                    </span>

                  </td>

                  <td className="p-4">
                    {item.ingreso}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* RESUMEN */}

      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow p-6 text-white">

        <h2 className="text-2xl font-bold">
          Resumen General
        </h2>

        <p className="mt-2 text-teal-100">
          El 75% del personal asistió puntualmente hoy.
        </p>

      </div>

    </div>
  );
}
