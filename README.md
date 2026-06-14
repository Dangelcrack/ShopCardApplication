# 🛒 ShopCard Application

Aplicación web para la gestión de una tienda de cartas coleccionables, desarrollada con **Angular 18** y **TypeScript**. Consume la API REST del backend **ShopCardApi**.

🌐 **Aplicación en producción:** https://shopcardapplication.web.app/

🔗 **Backend:** https://github.com/Dangelcrack/ShopCardApi

---

## ✨ Características

* 🃏 **Catálogo de cartas** — listado, búsqueda y detalle de productos.
* 🛒 **Gestión de tienda** — crear, editar y eliminar cartas.
* ⚡ **Server-Side Rendering (SSR)** — carga rápida y mejor SEO con Angular SSR.
* 📱 **Diseño responsive** adaptado a cualquier dispositivo.
* 🔗 **Integración con API REST** desarrollada con Spring Boot.

---

## 🛠️ Tecnologías

| Tecnología  | Versión | Uso                    |
| ----------- | ------- | ---------------------- |
| Angular     | 18.2    | Framework principal    |
| TypeScript  | —       | Lenguaje de desarrollo |
| Angular SSR | 18.2    | Server-Side Rendering  |
| RxJS        | —       | Programación reactiva  |
| HTML / CSS  | —       | Maquetación y estilos  |

---

## 🚀 Demo

Accede a la aplicación desplegada:

👉 https://shopcardapplication.web.app/

---

## ▶️ Instalación y ejecución

### Requisitos previos

* Node.js 18 o superior
* Angular CLI 18
* ShopCardApi en ejecución en `localhost:8080`

```bash
# 1. Clonar el repositorio
git clone https://github.com/Dangelcrack/ShopCardApplication.git
cd ShopCardApplication

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
ng serve
# → http://localhost:4200
```

---

## 🚀 Build de producción

```bash
# Compilar para producción
ng build

# Ejecutar con SSR
npm run serve:ssr
```

---

## 📁 Estructura del proyecto

```text
ShopCardApplication/
├── src/
│   ├── app/
│   │   ├── components/     # Componentes de la UI
│   │   ├── services/       # Llamadas a la API
│   │   └── models/         # Interfaces TypeScript
│   └── environments/       # Configuración por entorno
├── server.ts               # Servidor SSR
├── angular.json            # Configuración Angular CLI
└── package.json
```

---

## 🔄 Proyecto relacionado

Este frontend requiere el backend:

👉 https://github.com/Dangelcrack/ShopCardApi

---

## 👤 Autor

**Ángel Guerrero**

* GitHub: https://github.com/Dangelcrack
* Email: [angelguerrero540@gmail.com](mailto:angelguerrero540@gmail.com)

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
