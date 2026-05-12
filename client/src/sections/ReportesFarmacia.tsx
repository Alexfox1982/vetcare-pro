export default function ReportesFarmacia() {
  const ventas = [
    {
      producto: 'Antipulgas Premium',
      cantidad: 12,
      ingresos: 960,
    },
    {
      producto: 'Vitaminas Felinas',
      cantidad: 8,
      ingresos: 480,
    },
    {
      producto: 'Shampoo Canino',
      cantidad: 5,
      ingresos: 225,
    },
  ];

  const stockCritico = [
    {
      producto: 'Antibiótico Canino',
      stock: 2,
    },
    {
      producto: 'Desparasitante Plus',
      stock: 1,
    },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Reportes Farmacia
        </h1>

        <p className="text-gray-500 mt-1">
          Estadísticas y rendimiento de ventas
        </p>
      </div>

      {/* KPIs */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-sm text-gray-500">
            Ventas Hoy
          </p>

          <h2 className="text-3xl font-bold text-teal-600 mt-2">
            25
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-sm text-gray-500">
            Ingresos
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            Bs 3.250
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-sm text-gray-500">
            Productos Vendidos
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            43
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow border p-5">
          <p className="text-sm text-gray-500">
            Stock Crítico
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            2
          </h2>
        </div>

      </div>

      {/* MÁS VENDIDOS */}

      <div className="bg-white rounded-2xl shadow border">

        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            Productos Más Vendidos
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[600px]">

            <thead className="bg-gray-50">

              <tr>
                <th className="text-left p-4">
                  Producto
                </th>

                <th className="text-left p-4">
                  Cantidad
                </th>

                <th className="text-left p-4">
                  Ingresos
                </th>
              </tr>

            </thead>

            <tbody>

              {ventas.map((item, index) => (
                <tr
                  key={index}
                  className="border-t"
                >
                  <td className="p-4 font-medium">
                    {item.producto}
                  </td>

                  <td className="p-4">
                    {item.cantidad}
                  </td>

                  <td className="p-4 text-green-600 font-semibold">
                    Bs {item.ingresos}
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* STOCK CRÍTICO */}

      <div className="bg-white rounded-2xl shadow border">

        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold text-red-600">
            Productos con Stock Crítico
          </h2>
        </div>

        <div className="space-y-3 p-5">

          {stockCritico.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-red-50 rounded-xl p-4"
            >
              <div>
                <p className="font-medium">
                  {item.producto}
                </p>

                <p className="text-sm text-gray-500">
                  Stock disponible
                </p>
              </div>

              <div className="text-red-600 font-bold text-xl">
                {item.stock}
              </div>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
