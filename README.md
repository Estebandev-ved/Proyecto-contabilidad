# Sistema de Gestión Comercial e Inversiones: "Contabilidad Negocios Laura"

> **ERP Ligero para Microempresas con Modelo de Producción y Venta Ambulante**

Este proyecto es una solución integral diseñada para resolver la problemática real de microempresas que producen su propia mercancía (manufactura ligera) y realizan ventas directas sin un punto de venta fijo permanente (venta ambulante o por rutas). A diferencia de los POS tradicionales, este sistema gestiona el ciclo completo desde la **inversión en materia prima** hasta la **reconciliación diaria de stock**.

![Dashboard Preview](client/src/assets/preview.png) *(Nota: Imagen referencial)*

## 🚀 Propósito del Proyecto

El objetivo principal es profesionalizar la gestión financiera y operativa de negocios pequeños, permitiendo a los dueños responder preguntas críticas que un cuaderno de notas no puede:
- *"¿Realmente estoy ganando dinero con este lote de producción?"*
- *"¿Cuánto inventario salió hoy a la calle y cuánto regresó?"*
- *"¿Cuál es mi margen de ganancia real después de gastos operativos?"*

## 🌟 Características Clave (Business Logic)

### 1. Gestión de Lotes de Inversión (Unique Selling Point)
La mayoría de sistemas asumen que compras un producto terminado. Este sistema entiende que **fabricas** tu producto.
- Permite registrar una **Inversión Global** (ej: $66,700 en materia prima).
- Asocia múltiples **Productos Derivados** a esa inversión (ej: paquetes de diferentes tamaños).
- **Cálculo Automático de Rentabilidad**: Determina el punto de equilibrio y la ganancia proyectada basada en la producción real, no solo en ventas individuales.

### 2. Control de "Carga del Día" (Logística de Ruta)
Diseñado para vendedores que retiran mercancía del almacén principal para vender durante el día.
- **Check-out (Carga)**: Descuenta stock del almacén principal al iniciar el día.
- **Venta en Ruta**: Punto de venta móvil optimizado.
- **Check-in (Cierre/Reconciliación)**: Al final del día, el sistema reconcilia lo vendido vs. lo devuelto. Lo no vendido regresa automáticamente al stock principal.

### 3. Punto de Venta (POS) y Caja
- Interfaz rápida para registro de ventas.
- **Corte de Caja Automático**: Calcula el efectivo esperado basado en ventas y gastos registrados.
- Historial de transacciones y reporte de movimientos.

### 4. Reportes Financieros
- Visualización clara de **Ganancias Reales**.
- Exportación de reportes a Excel para contabilidad externa.

## 🛠️ Stack Tecnológico

Este proyecto está construido con una arquitectura moderna, escalable y mantenible:

- **Frontend**: 
  - [React](https://reactjs.org/) (Vite) para una experiencia de usuario rápida y reactiva.
  - [Tailwind CSS](https://tailwindcss.com/) para diseño estilizado y responsivo.
  - [Lucide React](https://lucide.dev/) para iconografía moderna.

- **Backend (API REST)**:
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/).
  - Arquitectura MVC (Model-View-Controller).

- **Base de Datos**:
  - [MySQL](https://www.mysql.com/) para integridad referencial y manejo robusto de datos transaccionales.
  - [Sequelize ORM](https://sequelize.org/) para gestión de modelos y migraciones.

## 🔮 Escalabilidad y Futuro (Roadmap a SaaS)

Este sistema tiene una arquitectura base sólida que permite su evolución hacia un modelo **Software as a Service (SaaS)** para comercializarlo a miles de microempresarios:

1.  **Arquitectura Multi-Tenant**: Modificar la base de datos para aislar los datos de múltiples empresas (inquilinos) en una sola instancia.
2.  **Autenticación y Roles**: Implementar JWT y roles de usuario (Admin, Vendedor, Dueño).
3.  **Despliegue en Nube**: 
    - Frontend en Vercel/Netlify.
    - Backend y BD en AWS/Railway/DigitalOcean.
4.  **Integración de Pagos**: Sistema de suscripción mensual (Stripe) para monetizar el software.
5.  **App Móvil Nativa**: Uso de React Native para que los vendedores usen sus celulares como POS en la calle.
6.  **IA Predictiva**: Análisis de datos históricos para sugerir qué productos llevar en la "Carga del Día" según el día de la semana.

---

## 💻 Instalación y Uso Local

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/tu-usuario/contabilidad-negocios-laura.git
    ```

2.  **Configurar Backend**
    ```bash
    cd server
    npm install
    # Configura tu archivo .env con las credenciales de MySQL
    node server.js
    ```

3.  **Configurar Frontend**
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  Abrir `http://localhost:5173` en el navegador.

---
*Desarrollado con ❤️ para empoderar a los pequeños negocios.*
