import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft,
  FileText,
  Download,
  Printer
} from 'lucide-react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePagosApi } from '@/hooks/usePagosApi';
import type { Pago, ReporteFinancieroDiario, ReporteFinancieroSemanal, ReporteFinancieroMensual } from '@/types';

export function ReportesManager() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fechaInicioSemana, setFechaInicioSemana] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [mesSeleccionado, setMesSeleccionado] = useState(format(new Date(), 'MM'));
  const [anioSeleccionado, setAnioSeleccionado] = useState(format(new Date(), 'yyyy'));
  
  const [reporteDiario, setReporteDiario] = useState<ReporteFinancieroDiario | null>(null);
  const [reporteSemanal, setReporteSemanal] = useState<ReporteFinancieroSemanal | null>(null);
  const [reporteMensual, setReporteMensual] = useState<ReporteFinancieroMensual | null>(null);
  
  const isLoading = false;

const generarReporteDiario = async () => {
  setReporteDiario({
    fecha: fechaSeleccionada,

    resumen: {
      montoTotal: 4850,
      cantidadTotal: 18,
      montoEfectivo: 2500,
      montoTarjeta: 1800,
      montoTransferencia: 550,
    },

    pagos: [
      {
        id: '1',
        fecha: fechaSeleccionada,
        monto: 250,
        metodoPago: 'efectivo',
        tipo: 'consulta',
        concepto: 'Consulta General',
        descripcion: 'Consulta veterinaria',
      },
      {
        id: '2',
        fecha: fechaSeleccionada,
        monto: 450,
        metodoPago: 'tarjeta',
        tipo: 'servicio',
        concepto: 'Vacunación',
        descripcion: 'Vacuna anual',
      },
      {
        id: '3',
        fecha: fechaSeleccionada,
        monto: 320,
        metodoPago: 'transferencia',
        tipo: 'producto',
        concepto: 'Medicamentos',
        descripcion: 'Venta farmacia',
      },
    ],

    detalles: [],
  } as any);
};
  
const generarReporteSemanal = async () => {
  setReporteSemanal({
    resumen: {
      montoTotal: 28450,
      cantidadTotal: 96,
    },
    dias: [],
    pagos: [],
  } as any);
};

const generarReporteMensual = async () => {
  setReporteMensual({
    resumen: {
      montoTotal: 98500,
      cantidadTotal: 312,
    },
    semanas: [],
    pagos: [],
  } as any);
};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return <Banknote className="w-4 h-4" />;
      case 'tarjeta': return <CreditCard className="w-4 h-4" />;
      case 'transferencia': return <ArrowRightLeft className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getMetodoLabel = (metodo: string) => {
    const labels: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia',
      otro: 'Otro',
    };
    return labels[metodo] || metodo;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      consulta: 'Consulta',
      servicio: 'Servicio',
      producto: 'Producto',
      otro: 'Otro',
    };
    return labels[tipo] || tipo;
  };

  const imprimirReporte = () => {
    window.print();
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Reportes Financieros</h1>
          <p className="text-gray-600">Volantes de ingresos por período</p>
        </div>
        <div className="flex gap-2">
          <Button
  variant="outline"
  onClick={imprimirReporte}
  className="rounded-xl shadow-sm hover:shadow-lg transition-all" className="no-print">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="diario" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-2 rounded-2xl bg-gray-100 p-2">
          <TabsTrigger value="diario">Diario</TabsTrigger>
          <TabsTrigger value="semanal">Semanal</TabsTrigger>
          <TabsTrigger value="mensual">Mensual</TabsTrigger>
        </TabsList>

        {/* REPORTE DIARIO */}
        <TabsContent value="diario" className="space-y-4">
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Reporte Diario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="fecha-diaria">Fecha</Label>
                  <Input
                    id="fecha-diaria"
                    type="date"
                    value={fechaSeleccionada}
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={generarReporteDiario} 
                  disabled={isLoading}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl shadow-lg"
                >
                  {isLoading ? 'Generando...' : 'Generar Reporte'}
                </Button>
              </div>
            </CardContent>
          </Card>
        
        {reporteDiario && (
  <div className="space-y-6">
    <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 rounded-3xl shadow-2xl">
      <CardContent className="p-8">
        <div className="text-center">
          <p className="uppercase tracking-wider text-cyan-100 text-sm">
            Ingresos del Día
          </p>

          <h2 className="text-5xl font-extrabold mt-3">
            {formatCurrency(4850)}
          </h2>

          <p className="mt-2 text-cyan-100">
            18 transacciones realizadas
          </p>
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Efectivo
          </p>

          <h3 className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(2500)}
          </h3>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Tarjetas
          </p>

          <h3 className="text-3xl font-bold text-blue-600 mt-2">
            {formatCurrency(1800)}
          </h3>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Transferencias
          </p>

          <h3 className="text-3xl font-bold text-purple-600 mt-2">
            {formatCurrency(550)}
          </h3>
        </CardContent>
      </Card>
    </div>

    <Card className="rounded-2xl shadow-xl border-0">
      <CardHeader>
        <CardTitle>
          Últimas Transacciones
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-medium">
                Consulta General
              </p>

              <p className="text-sm text-gray-500">
                Pago en efectivo
              </p>
            </div>

            <span className="font-bold text-green-600">
              {formatCurrency(250)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-medium">
                Vacunación
              </p>

              <p className="text-sm text-gray-500">
                Pago con tarjeta
              </p>
            </div>

            <span className="font-bold text-blue-600">
              {formatCurrency(450)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Venta Farmacia
              </p>

              <p className="text-sm text-gray-500">
                Transferencia bancaria
              </p>
            </div>

            <span className="font-bold text-purple-600">
              {formatCurrency(320)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}

        </TabsContent>

        {/* REPORTE SEMANAL */}
        <TabsContent value="semanal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Reporte Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="fecha-semana">Inicio de Semana (Lunes)</Label>
                  <Input
                    id="fecha-semana"
                    type="date"
                    value={fechaInicioSemana}
                    onChange={(e) => setFechaInicioSemana(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={generarReporteSemanal} 
                  disabled={isLoading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isLoading ? 'Generando...' : 'Generar Reporte'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {reporteSemanal && (
  <div className="space-y-6">
    <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 rounded-3xl shadow-2xl">
      <CardContent className="p-8 text-center">
        <p className="uppercase tracking-wider text-blue-100 text-sm">
          Reporte Semanal
        </p>

        <h2 className="text-5xl font-extrabold mt-3">
          {formatCurrency(28450)}
        </h2>

        <p className="mt-2 text-blue-100">
          96 transacciones esta semana
        </p>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Lunes
          </p>

          <h3 className="text-2xl font-bold mt-2">
            {formatCurrency(4200)}
          </h3>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Martes
          </p>

          <h3 className="text-2xl font-bold mt-2">
            {formatCurrency(3800)}
          </h3>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Miércoles
          </p>

          <h3 className="text-2xl font-bold mt-2">
            {formatCurrency(5100)}
          </h3>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Jueves
          </p>

          <h3 className="text-2xl font-bold mt-2">
            {formatCurrency(6200)}
          </h3>
        </CardContent>
      </Card>
    </div>
  </div>
)}

        </TabsContent>

        {/* REPORTE MENSUAL */}
        <TabsContent value="mensual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Reporte Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div>
                  <Label htmlFor="mes">Mes</Label>
                  <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">Enero</SelectItem>
                      <SelectItem value="02">Febrero</SelectItem>
                      <SelectItem value="03">Marzo</SelectItem>
                      <SelectItem value="04">Abril</SelectItem>
                      <SelectItem value="05">Mayo</SelectItem>
                      <SelectItem value="06">Junio</SelectItem>
                      <SelectItem value="07">Julio</SelectItem>
                      <SelectItem value="08">Agosto</SelectItem>
                      <SelectItem value="09">Septiembre</SelectItem>
                      <SelectItem value="10">Octubre</SelectItem>
                      <SelectItem value="11">Noviembre</SelectItem>
                      <SelectItem value="12">Diciembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="anio">Año</Label>
                  <Select value={anioSeleccionado} onValueChange={setAnioSeleccionado}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={generarReporteMensual} 
                  disabled={isLoading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isLoading ? 'Generando...' : 'Generar Reporte'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {reporteMensual && (
  <div className="space-y-6">
    <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white border-0 rounded-3xl shadow-2xl">
      <CardContent className="p-8 text-center">
        <p className="uppercase tracking-wider text-pink-100 text-sm">
          Reporte Mensual
        </p>

        <h2 className="text-5xl font-extrabold mt-3">
          {formatCurrency(98500)}
        </h2>

        <p className="mt-2 text-pink-100">
          312 transacciones este mes
        </p>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Consultas
          </p>

          <h3 className="text-3xl font-bold text-teal-600 mt-2">
            148
          </h3>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Vacunaciones
          </p>

          <h3 className="text-3xl font-bold text-blue-600 mt-2">
            82
          </h3>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Cirugías
          </p>

          <h3 className="text-3xl font-bold text-orange-600 mt-2">
            14
          </h3>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">
            Ventas Farmacia
          </p>

          <h3 className="text-3xl font-bold text-purple-600 mt-2">
            68
          </h3>
        </CardContent>
      </Card>
    </div>
  </div>
)}

        </TabsContent>
      </Tabs>
    </div>
  );
}
