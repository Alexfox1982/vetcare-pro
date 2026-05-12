import { useState } from 'react';

import { Layout } from '@/sections/Layout';
import { Dashboard } from '@/sections/Dashboard';
import { CitasManager } from '@/sections/CitasManager';
import { DuenosManager } from '@/sections/DuenosManager';
import { MascotasManager } from '@/sections/MascotasManager';
import { HistorialManager } from '@/sections/HistorialManager';
import { PersonalManager } from '@/sections/PersonalManager';
import { TurnosManager } from '@/sections/TurnosManager';
import { AsistenciaManager } from '@/sections/AsistenciaManager';
import { ReportesManager } from '@/sections/ReportesManager';

import FarmaciaManager from '@/sections/FarmaciaManager';
import ReportesFarmacia from '@/sections/ReportesFarmacia';

type ViewType =
  | 'dashboard'
  | 'citas'
  | 'duenos'
  | 'mascotas'
  | 'historial'
  | 'personal'
  | 'turnos'
  | 'asistencia'
  | 'reportes'
  | 'farmacia'
  | 'venta-farmacia'
  | 'reportes-farmacia';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showLogin, setShowLogin] = useState(false);

  const [currentView, setCurrentView] =
    useState<ViewType>('dashboard');

  const [selectedMascotaId, setSelectedMascotaId] =
    useState<string>();

  const user = {
    id: '1',
    nombre: 'Administrador',
    rol: 'admin',
    email: 'admin@vetcare.com',
  };

  const users = [
    {
      id: '1',
      nombre: 'Dr. Carlos',
      rol: 'medico',
      email: 'carlos@vetcare.com',
    },
  ];

  const duenos = [
    {
      id: '1',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@correo.com',
      telefono: '70000001',
      direccion: 'Villa Montes',
      notas: '',
      fechaRegistro: new Date().toISOString(),
    },
  ];

  const mascotas = [
    {
      id: '1',
      nombre: 'Firulais',
      especie: 'Perro',
      raza: 'Golden',
      edad: 3,
      peso: 25,
      color: 'Dorado',
      sexo: 'Macho',
      duenoId: '1',
      fechaRegistro: new Date().toISOString(),
    },
  ];

  const citas = [
    {
      id: '1',
      mascotaId: '1',
      tipo: 'consulta',
      fecha: new Date().toISOString(),
      hora: '10:00',
      estado: 'pendiente',
    },
  ];

  const turnos = [
    {
      id: '1',
      usuario: 'Dr. Carlos',
      horario: 'Mañana',
    },
  ];

  const historial = [
    {
      id: '1',
      mascotaId: '1',
      medicoId: '1',
      fecha: new Date().toISOString(),
      motivo: 'Vacunación',
      diagnostico: 'Paciente saludable',
      tratamiento: 'Vacuna anual',
      observaciones: 'Sin problemas',
      peso: 25,
      temperatura: 38,
    },
  ];

  const emptyFn = () => {
    console.log('Demo');
  };

  const handleViewMascotas = () => {
    setCurrentView('mascotas');
  };

  const handleViewHistorial = (mascotaId: string) => {
    setSelectedMascotaId(mascotaId);
    setCurrentView('historial');
  };

  const handleBackFromHistorial = () => {
    setSelectedMascotaId(undefined);
    setCurrentView('mascotas');
  };

  const medicos = users.filter(
    (u) => u.rol === 'medico'
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            citas={citas}
            mascotas={mascotas}
            duenos={duenos}
            users={users}
            onNuevaCita={() => setCurrentView('citas')}
            onVerCita={() => setCurrentView('citas')}
          />
        );

      case 'citas':
        return (
          <CitasManager
            citas={citas}
            mascotas={mascotas}
            duenos={duenos}
            medicos={medicos}
            onAdd={emptyFn}
            onUpdate={emptyFn}
            onDelete={emptyFn}
          />
        );

      case 'duenos':
        return (
          <DuenosManager
            duenos={duenos}
            mascotas={mascotas}
            onAdd={emptyFn}
            onUpdate={emptyFn}
            onDelete={emptyFn}
            onViewMascotas={handleViewMascotas}
          />
        );

      case 'mascotas':
        return (
          <MascotasManager
            mascotas={mascotas}
            duenos={duenos}
            onAdd={emptyFn}
            onUpdate={emptyFn}
            onDelete={emptyFn}
            onViewHistorial={handleViewHistorial}
          />
        );

      case 'historial':
        return (
          <HistorialManager
            historial={historial}
            mascotas={mascotas}
            duenos={duenos}
            medicos={medicos}
            onAdd={emptyFn}
            onUpdate={emptyFn}
            onDelete={emptyFn}
            selectedMascotaId={selectedMascotaId}
            onBack={handleBackFromHistorial}
          />
        );

      case 'personal':
        return (
          <PersonalManager
            users={users}
            currentUser={user}
            onAdd={emptyFn}
            onUpdate={emptyFn}
            onDelete={emptyFn}
          />
        );

      case 'turnos':
        return (
          <TurnosManager
            turnos={turnos}
            users={users}
            onAdd={emptyFn}
            onUpdate={emptyFn}
            onDelete={emptyFn}
          />
        );

      case 'asistencia':
        return (
          <AsistenciaManager
            currentUser={user}
            users={users}
          />
        );

      case 'reportes':
        return <ReportesManager />;

      case 'farmacia':
        return (
          <FarmaciaManager currentUser={user} />
        );

      case 'venta-farmacia':
        return (
  <div className="space-y-6">

    {/* HEADER */}

    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Punto de Venta
      </h1>

      <p className="text-gray-500 mt-1">
        Ventas rápidas de farmacia veterinaria
      </p>
    </div>

    {/* PRODUCTOS */}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <div className="bg-white rounded-2xl shadow border p-5">

        <h2 className="font-semibold text-lg">
          Antipulgas Premium
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Stock: 15 unidades
        </p>

        <div className="mt-4 flex items-center justify-between">

          <span className="text-2xl font-bold text-teal-600">
            Bs 80
          </span>

          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl">
            Agregar
          </button>

        </div>

      </div>

      <div className="bg-white rounded-2xl shadow border p-5">

        <h2 className="font-semibold text-lg">
          Shampoo Canino
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Stock: 8 unidades
        </p>

        <div className="mt-4 flex items-center justify-between">

          <span className="text-2xl font-bold text-teal-600">
            Bs 45
          </span>

          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl">
            Agregar
          </button>

        </div>

      </div>

      <div className="bg-white rounded-2xl shadow border p-5">

        <h2 className="font-semibold text-lg">
          Vitaminas Felinas
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Stock: 20 unidades
        </p>

        <div className="mt-4 flex items-center justify-between">

          <span className="text-2xl font-bold text-teal-600">
            Bs 60
          </span>

          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl">
            Agregar
          </button>

        </div>

      </div>

    </div>

    {/* CARRITO */}

    <div className="bg-white rounded-2xl shadow border">

      <div className="p-5 border-b">

        <h2 className="text-xl font-semibold">
          Carrito de Venta
        </h2>

      </div>

      <div className="p-5 space-y-4">

        <div className="flex items-center justify-between border rounded-xl p-4">

          <div>
            <p className="font-medium">
              Antipulgas Premium
            </p>

            <p className="text-sm text-gray-500">
              Cantidad: 2
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold text-teal-600">
              Bs 160
            </p>
          </div>

        </div>

        <div className="flex items-center justify-between border rounded-xl p-4">

          <div>
            <p className="font-medium">
              Shampoo Canino
            </p>

            <p className="text-sm text-gray-500">
              Cantidad: 1
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold text-teal-600">
              Bs 45
            </p>
          </div>

        </div>

      </div>

      {/* TOTAL */}

      <div className="border-t p-5">

        <div className="flex items-center justify-between mb-4">

          <span className="text-lg font-semibold">
            Total
          </span>

          <span className="text-3xl font-bold text-green-600">
            Bs 205
          </span>

        </div>

        <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-semibold shadow-lg">

          Finalizar Venta

        </button>

      </div>

    </div>

    {/* RESUMEN */}

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      <div className="bg-blue-50 rounded-2xl p-5">
        <p className="text-sm text-gray-500">
          Ventas Hoy
        </p>

        <h2 className="text-3xl font-bold text-blue-700 mt-2">
          12
        </h2>
      </div>

      <div className="bg-green-50 rounded-2xl p-5">
        <p className="text-sm text-gray-500">
          Ingresos
        </p>

        <h2 className="text-3xl font-bold text-green-700 mt-2">
          Bs 1.250
        </h2>
      </div>

      <div className="bg-orange-50 rounded-2xl p-5">
        <p className="text-sm text-gray-500">
          Productos
        </p>

        <h2 className="text-3xl font-bold text-orange-700 mt-2">
          43
        </h2>
      </div>

      <div className="bg-purple-50 rounded-2xl p-5">
        <p className="text-sm text-gray-500">
          Clientes
        </p>

        <h2 className="text-3xl font-bold text-purple-700 mt-2">
          9
        </h2>
      </div>

    </div>

  </div>
);

      case 'reportes-farmacia':
        return (
          <ReportesFarmacia currentUser={user} />
        );

      default:
        return (
          <Dashboard
            citas={citas}
            mascotas={mascotas}
            duenos={duenos}
            users={users}
            onNuevaCita={() => setCurrentView('citas')}
            onVerCita={() => setCurrentView('citas')}
          />
        );
    }
  };

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loginError, setLoginError] = useState('');

if (!isLoggedIn) {

  // LOGIN
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4">

        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">

          <div className="text-center mb-8">

            <h1 className="text-4xl font-extrabold text-teal-700">
              VetCare Pro
            </h1>

            <p className="text-gray-500 mt-2">
              Plataforma Veterinaria Inteligente
            </p>

          </div>

          {loginError && (
            <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
              {loginError}
            </div>
          )}

          <div className="space-y-4">

            <div>
              <label className="text-sm font-medium text-gray-700">
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="admin@vetcare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Contraseña
              </label>

              <input
                type="password"
                placeholder="123456"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              onClick={() => {
                if (
                  email === 'admin@vetcare.com' &&
                  password === '123456'
                ) {
                  setLoginError('');
                  setIsLoggedIn(true);
                } else {
                  setLoginError('Credenciales incorrectas');
                }
              }}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-4 rounded-2xl font-semibold shadow-xl"
            >
              Iniciar Sesión
            </button>

            <button
              onClick={() => setShowLogin(false)}
              className="w-full border border-gray-200 py-3 rounded-2xl"
            >
              Volver
            </button>

          </div>

        </div>

      </div>
    );
  }

  // LANDING PAGE
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
     
      {/* NAVBAR */}

<div className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">

  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

    <div>

      <h1 className="text-2xl font-black text-teal-400">
        VetCare Pro
      </h1>

    </div>

    <div className="hidden md:flex items-center gap-8 text-slate-300">

      <a href="#inicio" className="hover:text-white transition">
        Inicio
      </a>

      <a href="#funciones" className="hover:text-white transition">
        Funciones
      </a>

      <a href="#precios" className="hover:text-white transition">
        Precios
      </a>

      <a href="#contacto" className="hover:text-white transition">
        Contacto
      </a>

    </div>

    <button
      onClick={() => setShowLogin(true)}
      className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-5 py-2 rounded-xl font-bold"
    >
      Ingresar
    </button>

  </div>

</div>

      {/* HERO */}

      <div id="inicio" className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <div className="inline-flex items-center bg-teal-500/10 border border-teal-400/20 rounded-full px-4 py-2 text-sm text-teal-300 mb-6">
              Software Veterinario Inteligente
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">

              Gestión veterinaria
              <span className="gradient-text">
                {' '}moderna
              </span>

            </h1>

            <p className="text-xl text-slate-300 mt-8 leading-relaxed">

              Administra citas, historial clínico,
              farmacia, personal y ventas desde
              una sola plataforma moderna.

            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">

              <button
                onClick={() => setShowLogin(true)}
                className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl"
              >
                Ingresar al Sistema
              </button>

              <button className="border border-slate-700 hover:border-slate-500 px-8 py-4 rounded-2xl font-semibold">
                Ver Demo
              </button>

            </div>

          </div>

          {/* MOCKUP */}

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">

            <div className="grid grid-cols-2 gap-4">

              <div className="bg-teal-500 rounded-2xl p-6">
                <p className="text-sm text-teal-100">
                  Citas Hoy
                </p>

                <h2 className="text-4xl font-black mt-2">
                  24
                </h2>
              </div>

              <div className="bg-blue-500 rounded-2xl p-6">
                <p className="text-sm text-blue-100">
                  Pacientes
                </p>

                <h2 className="text-4xl font-black mt-2">
                  1.284
                </h2>
              </div>

              <div className="bg-purple-500 rounded-2xl p-6">
                <p className="text-sm text-purple-100">
                  Ventas
                </p>

                <h2 className="text-4xl font-black mt-2">
                  Bs 18K
                </h2>
              </div>

              <div className="bg-orange-500 rounded-2xl p-6">
                <p className="text-sm text-orange-100">
                  Clientes
                </p>

                <h2 className="text-4xl font-black mt-2">
                  742
                </h2>
              </div>

            </div>

          </div>

        </div>

        {/* FEATURES */}

      <div id="funciones" className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-black">
            Todo lo que tu clínica necesita
          </h2>

          <p className="text-slate-400 mt-6 text-xl">
            Diseñado para clínicas veterinarias modernas
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-6 backdrop-blur-xl">

            <div className="text-4xl mb-4">
              🩺
            </div>

            <h3 className="text-2xl font-bold">
              Historial Clínico
            </h3>

            <p className="text-slate-400 mt-3">
              Expedientes completos y organizados.
            </p>

          </div>

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-6 backdrop-blur-xl">

            <div className="text-4xl mb-4">
              💊
            </div>

            <h3 className="text-2xl font-bold">
              Farmacia
            </h3>

            <p className="text-slate-400 mt-3">
              Control inteligente de inventario.
            </p>

          </div>

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-6 backdrop-blur-xl">

            <div className="text-4xl mb-4">
              📅
            </div>

            <h3 className="text-2xl font-bold">
              Citas
            </h3>

            <p className="text-slate-400 mt-3">
              Agenda moderna y rápida.
            </p>

          </div>

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-6 backdrop-blur-xl">

            <div className="text-4xl mb-4">
              📈
            </div>

            <h3 className="text-2xl font-bold">
              Reportes
            </h3>

            <p className="text-slate-400 mt-3">
              Métricas y estadísticas en tiempo real.
            </p>

          </div>

        </div>

      </div>

      {/* PLANES */}

      <div id="precios" className="max-w-7xl mx-auto px-6 pb-24">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-black">
            Planes Simples
          </h2>

          <p className="text-slate-400 mt-6 text-xl">
            Escala tu veterinaria fácilmente
          </p>

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* BASIC */}

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-8">

            <h3 className="text-3xl font-bold">
              Básico
            </h3>

            <p className="text-slate-400 mt-2">
              Ideal para clínicas pequeñas
            </p>

            <div className="mt-8">

              <span className="text-5xl font-black">
                Bs 99
              </span>

              <span className="text-slate-400">
                /mes
              </span>

            </div>

            <ul className="mt-8 space-y-4 text-slate-300">

              <li>✔ Agenda de citas</li>
              <li>✔ Historial clínico</li>
              <li>✔ Gestión mascotas</li>

            </ul>

          </div>

          {/* PRO */}

          <div className="bg-teal-500 text-slate-900 rounded-3xl p-8 shadow-2xl scale-105">

            <div className="inline-block bg-white rounded-full px-4 py-1 text-sm font-bold mb-4">
              MÁS POPULAR
            </div>

            <h3 className="text-3xl font-black">
              Profesional
            </h3>

            <p className="mt-2 opacity-80">
              Para clínicas en crecimiento
            </p>

            <div className="mt-8">

              <span className="text-5xl font-black">
                Bs 249
              </span>

              <span>
                /mes
              </span>

            </div>

            <ul className="mt-8 space-y-4">

              <li>✔ Todo el plan básico</li>
              <li>✔ Farmacia completa</li>
              <li>✔ Punto de venta</li>
              <li>✔ Reportes avanzados</li>

            </ul>

          </div>

          {/* ENTERPRISE */}

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-8">

            <h3 className="text-3xl font-bold">
              Enterprise
            </h3>

            <p className="text-slate-400 mt-2">
              Para cadenas veterinarias
            </p>

            <div className="mt-8">

              <span className="text-5xl font-black">
                Custom
              </span>

            </div>

            <ul className="mt-8 space-y-4 text-slate-300">

              <li>✔ Multi sucursal</li>
              <li>✔ Multi usuarios</li>
              <li>✔ Analytics avanzados</li>
              <li>✔ Soporte prioritario</li>

            </ul>

          </div>

        </div>

      </div>

      {/* TESTIMONIOS */}

      <div className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-black">
            Clínicas que ya confían
          </h2>

          <p className="text-slate-400 mt-6 text-xl">
            Veterinarias modernas creciendo con VetCare Pro
          </p>

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-8">

            <p className="text-slate-300 leading-relaxed">
              “La gestión de citas y farmacia redujo muchísimo nuestro trabajo administrativo.”
            </p>

            <div className="mt-6">
              <h3 className="font-bold text-xl">
                Clínica San Roque
              </h3>

              <p className="text-slate-500">
                Cochabamba
              </p>
            </div>

          </div>

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-8">

            <p className="text-slate-300 leading-relaxed">
              “El historial clínico digital nos ayudó a organizarnos completamente.”
            </p>

            <div className="mt-6">
              <h3 className="font-bold text-xl">
                VetCenter Plus
              </h3>

              <p className="text-slate-500">
                Santa Cruz
              </p>
            </div>

          </div>

          <div className="glass-card hover-lift border border-white/10 rounded-3xl p-8">

            <p className="text-slate-300 leading-relaxed">
              “La plataforma se siente moderna, rápida y muy profesional.”
            </p>

            <div className="mt-6">
              <h3 className="font-bold text-xl">
                Animal Care Pro
              </h3>

              <p className="text-slate-500">
                La Paz
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* CTA FINAL */}

      <div className="max-w-5xl mx-auto px-6 pb-24">

        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[40px] p-12 text-center shadow-2xl">

          <h2 className="text-5xl font-black text-slate-900">
            Lleva tu veterinaria al siguiente nivel
          </h2>

          <p className="text-slate-800 text-xl mt-6">
            Automatiza citas, farmacia, ventas y gestión clínica desde una sola plataforma.
          </p>

          <button
            onClick={() => setShowLogin(true)}
            className="mt-10 bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl"
          >
            Comenzar Ahora
          </button>

        </div>

      </div>

      {/* FOOTER */}

      <footer id="contactos" className="border-t border-white/10">

        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

          <div>
            <h3 className="text-2xl font-black text-teal-400">
              VetCare Pro
            </h3>

            <p className="text-slate-500 mt-2">
              Plataforma Veterinaria Inteligente
            </p>
            <p className="text-slate-500 text-sm mt-1">
               foxcomptja@gmail.com
           </p>

           <p className="text-slate-500 text-sm">
              +591 77172153
           </p>
          </div>

          <div className="flex gap-8 text-slate-400">

            <a href="#inicio" className="hover:text-white transition">
              Inicio
            </a>

            <a href="#funciones" className="hover:text-white transition">
              Funciones
            </a>

            <a href="#precios" className="hover:text-white transition">
              Precios
            </a>

            <a href="#contacto" className="hover:text-white transition">
              Contacto
            </a>

          </div>

        </div>

      </footer>

      </div>

    </div>
  );
}

  return (
    <Layout
      userRole={user.rol}
      userName={user.nombre}
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={() => setIsLoggedIn(false)}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
