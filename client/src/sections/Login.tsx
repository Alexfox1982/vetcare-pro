import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Stethoscope } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor ingrese email y contraseña');
      return;
    }
    
    const success = onLogin(email, password);
    if (!success) {
      setError('Credenciales incorrectas');
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 flex items-center justify-center p-4">

  <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
    
    <CardHeader className="text-center space-y-5 pt-8">
      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-xl">
        <Stethoscope className="w-10 h-10 text-white" />
      </div>

      <div>
        <CardTitle className="text-3xl font-extrabold text-gray-800">
          VetCare Pro
        </CardTitle>

        <CardDescription className="text-gray-500 mt-2">
          Plataforma Veterinaria Inteligente
        </CardDescription>
      </div>
    </CardHeader>

    <CardContent className="px-8 pb-8">

      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">
            Correo electrónico
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="usuario@vetcare.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña
          </Label>

          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
        >
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-sm">
        <p className="font-semibold mb-2">
          Usuarios Demo
        </p>

        <div className="space-y-1 text-xs">
          <p><strong>admin@vetcare.com</strong> / 123456</p>
          <p><strong>medico@vetcare.com</strong> / 123456</p>
          <p><strong>secretaria@vetcare.com</strong> / 123456</p>
        </div>
      </div>

    </CardContent>
  </Card>
</div>

);
}
