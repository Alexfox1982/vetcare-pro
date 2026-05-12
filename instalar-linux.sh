#!/bin/bash

# ============================================================
# VetCare Pro - Script de Instalación para Linux
# ============================================================

set -e  # Detenerse si hay errores

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones
echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    echo_warning "Este script se recomienda ejecutar como root (sudo)"
    read -p "¿Continuar de todos modos? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

echo "============================================================"
echo "         VETCARE PRO - INSTALADOR LINUX"
echo "============================================================"
echo

# Detectar distribución
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    OS=$(uname -s)
    VER=$(uname -r)
fi

echo_info "Sistema detectado: $OS $VER"
echo

# ============================================================
# PASO 1: Verificar/Instalar Node.js
# ============================================================
echo_info "Paso 1/5: Verificando Node.js..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo_success "Node.js encontrado: $NODE_VERSION"
else
    echo_warning "Node.js no encontrado. Instalando..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    else
        echo_error "Distribución no soportada para instalación automática de Node.js"
        echo "Por favor instala Node.js manualmente desde: https://nodejs.org"
        exit 1
    fi
    
    echo_success "Node.js instalado correctamente"
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo_error "npm no encontrado. Instalando..."
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get install -y npm
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        yum install -y npm
    fi
fi

echo_success "Node.js: $(node --version)"
echo_success "npm: $(npm --version)"
echo

# ============================================================
# PASO 2: Instalar PM2
# ============================================================
echo_info "Paso 2/5: Verificando PM2..."

if command -v pm2 &> /dev/null; then
    echo_success "PM2 ya está instalado"
else
    echo_warning "Instalando PM2..."
    npm install -g pm2
    echo_success "PM2 instalado correctamente"
fi
echo

# ============================================================
# PASO 3: Instalar dependencias del servidor
# ============================================================
echo_info "Paso 3/5: Instalando dependencias del servidor..."

cd server

if [ -d "node_modules" ]; then
    echo_warning "Las dependencias ya están instaladas"
    read -p "¿Reinstalar? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -rf node_modules package-lock.json
        npm install
    fi
else
    npm install
fi

echo_success "Dependencias instaladas"
echo

# ============================================================
# PASO 4: Configurar base de datos
# ============================================================
echo_info "Paso 4/5: Configurando base de datos..."

if [ -f "database.sqlite" ]; then
    echo_warning "La base de datos ya existe"
    read -p "¿Reiniciar con datos de demo? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm database.sqlite
        npm run setup
    fi
else
    npm run setup
fi

echo_success "Base de datos configurada"
echo

# ============================================================
# PASO 5: Iniciar aplicación con PM2
# ============================================================
echo_info "Paso 5/5: Iniciando aplicación..."

# Detener instancia anterior si existe
pm2 stop vetcare 2>/dev/null || true
pm2 delete vetcare 2>/dev/null || true

# Iniciar nueva instancia
pm2 start server.js --name vetcare

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

echo_success "Aplicación iniciada con PM2"
echo

# ============================================================
# RESUMEN
# ============================================================
echo "============================================================"
echo "         INSTALACIÓN COMPLETADA"
echo "============================================================"
echo
echo_success "VetCare Pro está corriendo!"
echo
echo "Información:"
echo "  - URL local: http://localhost:3000"
echo "  - URL red:   http://$(hostname -I | awk '{print $1}'):3000"
echo
echo "Comandos útiles:"
echo "  pm2 status        - Ver estado"
echo "  pm2 logs vetcare  - Ver logs"
echo "  pm2 restart vetcare - Reiniciar"
echo "  pm2 stop vetcare  - Detener"
echo
echo "Usuarios de demo:"
echo "  admin@vetcare.com / 123456"
echo "  medico@vetcare.com / 123456"
echo "  secretaria@vetcare.com / 123456"
echo "  recepcionista@vetcare.com / 123456"
echo
echo "============================================================"
