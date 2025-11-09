# Kick Viewer Tester 🎥

Una herramienta profesional de testing para simular viewers concurrentes en streams de Kick.com, diseñada para evaluar la capacidad de carga y rendimiento de tus canales.

---

## ⚠️ Uso Responsable

Esta herramienta está diseñada **exclusivamente** para:
- Testing de carga en tus **propios canales de Kick**
- Evaluación de capacidad de viewers concurrentes
- Canales **no monetizados** en fase de prueba
- Propósitos educativos y de desarrollo

**NO debe usarse para:**
- Inflar métricas artificialmente
- Simular audiencia en canales monetizados
- Violar los términos de servicio de Kick.com
- Cualquier actividad fraudulenta o maliciosa

---

## 🌟 Características

- 🎯 **Viewers Anónimos**: Simula viewers sin autenticación (10-50 concurrentes)
- 🔐 **Viewers Autenticados**: Usa cuentas reales para testing más preciso (opcional)
- 📊 **Estadísticas en Tiempo Real**: Monitorea viewers activos, conexiones y tiempo total
- 🔄 **Sistema de Proxies**: Soporta HTTP, HTTPS, SOCKS4 y SOCKS5
- 🎨 **Interfaz Moderna**: UI intuitiva y profesional con React + TypeScript
- ⚙️ **Configuración Sencilla**: Editor integrado para proxies, user-agents y cuentas
- 📡 **Conexiones Persistentes**: Mantiene viewers activos con heartbeats automáticos
- 🛠️ **Worker-Based**: Arquitectura eficiente con hilos separados para cada viewer
- 🌐 **URLs Flexibles**: Acepta URLs de canal, stream específico o solo el nombre del canal

---

## 📋 Requisitos

- Node.js v14 o superior
- npm o bun
- Lista de proxies válidos (en `data/proxies.txt`)
- Lista de user-agents (en `data/uas.txt`)
- [Opcional] Cuentas de Kick para testing autenticado

---

## 🚀 Instalación y Configuración

### Instalación Rápida

```bash
# 1. Clonar o descargar el proyecto
cd kick-viewer-tester

# 2. Instalar dependencias
npm install

# 3. Los archivos de configuración ya están incluidos
# - data/proxies.txt (491 proxies preconfigurados)
# - data/uas.txt (10 user-agents incluidos)
# - data/accounts.json (se crea vacío automáticamente)
```

### Modo Desarrollo

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### Modo Producción

```bash
# Construir el proyecto
npm run build

# Iniciar en producción
npm start
```

- **Aplicación completa**: http://localhost:3000

### Docker (Opcional)

```bash
# Usando Docker Compose
docker-compose up

# O construir manualmente
docker build -t kick-viewer-tester .
docker run -p 3000:3000 kick-viewer-tester
```

---

## ⚙️ Configuración de Archivos

### 1. Proxies (`data/proxies.txt`)

El sistema viene con 491 proxies SOCKS4/SOCKS5 preconfigurados. Formatos soportados:

```
socks5://host:port
socks4://host:port
http://host:port
https://host:port
socks5://user:pass@host:port
http://user:pass@host:port
```

**Ejemplo**:
```
socks5://proxy1.example.com:1080
http://user:password@proxy2.example.com:8080
```

### 2. User Agents (`data/uas.txt`)

El sistema incluye 10 user-agents variados. Un user-agent por línea:

```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...
Mozilla/5.0 (X11; Linux x86_64)...
```

### 3. Cuentas de Kick (`data/accounts.json`) - Opcional

Formato JSON para cuentas autenticadas:

```json
[
  {
    "username": "testuser1",
    "email": "test1@example.com",
    "token": "your_session_token_here",
    "isActive": true
  },
  {
    "username": "testuser2",
    "email": "test2@example.com",
    "token": "your_session_token_here",
    "isActive": true
  }
]
```

**¿Cómo obtener el token de sesión?**

1. Abre Kick.com en tu navegador
2. Inicia sesión con una cuenta de prueba
3. Abre DevTools (F12) → Application → Cookies → https://kick.com
4. Busca la cookie de sesión (ej: `kick_session`)
5. Copia el valor del token

**Nota**: Solo usa cuentas de prueba que no tengas problema en usar para testing.

---

## 📖 Guía de Uso

### Uso Básico

1. **Inicia la aplicación**:
   ```bash
   npm run dev
   ```

2. **Abre el navegador**: http://localhost:5173

3. **Introduce la URL de Kick** (acepta múltiples formatos):
   - URL del canal: `https://kick.com/xqc`
   - URL del stream: `https://kick.com/xqc/livestream/stream-id`
   - Solo nombre: `xqc`

4. **Configura el test**:
   - Anonymous Viewers: `10` (0-50)
   - Authenticated Viewers: `0` (0-20, requiere cuentas)
   - Test Duration: `60` segundos (10-300)

5. **Haz clic en "Start Viewer Test"**

6. **Monitorea las estadísticas** en tiempo real:
   - Active Viewers
   - Total Connections
   - Total View Time
   - Available Accounts

### Editor de Configuración

Haz clic en el botón 📜 (ScrollText) para abrir el editor donde puedes:
- Editar proxies en vivo
- Modificar user-agents
- Agregar/editar cuentas de Kick
- Guardar cambios sin reiniciar

---

## 🧪 Guía de Testing Completa

### Test 1: Viewers Anónimos (Recomendado para empezar)

**Configuración**:
```
Anonymous Viewers: 5
Authenticated Viewers: 0
Duration: 60 segundos
Channel: https://kick.com/xqc
```

**Resultados esperados**:
- ✅ Logs: "🔗 Connecting to..."
- ✅ Logs: "✅ Connected to channelname - LIVE/OFFLINE"
- ✅ Contador "Active Viewers" aumenta
- ✅ Heartbeats cada 30 segundos: "💓 Heartbeat #N"
- ✅ Después de 60s: "⏹️ Viewer session ended"

**Problemas comunes**:
- ❌ **"Failed to connect"**: Proxies no válidos → Verifica tus proxies
- ❌ **"Channel not found"**: URL incorrecta → Verifica la URL
- ⚠️ **"Not enough proxies"**: Reduce viewers o agrega más proxies

### Test 2: Viewers Autenticados (Avanzado)

**Requisitos previos**:
1. Configura `data/accounts.json` con al menos 2 cuentas
2. Reinicia el servidor: `Ctrl+C` → `npm run dev`

**Configuración**:
```
Anonymous Viewers: 3
Authenticated Viewers: 2
Duration: 60 segundos
```

**Verificación**:
- El campo "Available Accounts" debe mostrar > 0
- Los logs mostrarán "(authenticated)" para esos viewers
- Las cuentas entran en cooldown de 5 minutos después del uso

### Test 3: Modo Híbrido (Más realista)

**Proporción recomendada**: 70% anónimos, 30% autenticados

```
Para 10 viewers:
- Anonymous: 7
- Authenticated: 3

Para 50 viewers:
- Anonymous: 35
- Authenticated: 15
```

### Test 4: Prueba de Carga

**Objetivo**: Determinar el máximo de viewers que tu sistema puede manejar

**Procedimiento incremental**:
1. Inicio: 10 viewers
2. Incremento: +10 cada test
3. Máximo: 50 viewers (o hasta degradación)

**Para cada nivel**:
- Ejecuta por 60 segundos
- Observa logs y métricas
- Verifica que no haya errores
- Monitorea CPU y RAM

**Límites esperados** (hardware típico: 8GB RAM, quad-core):
- ✅ Óptimo: 20-30 viewers concurrentes
- ⚠️ Máximo estable: 40-50 viewers
- 🔴 Límite técnico: 50+ (requiere más recursos)

---

## 🐛 Troubleshooting

### Problema: No valid proxies available

**Causas y soluciones**:
- Verifica que `data/proxies.txt` no esté vacío
- Verifica el formato de los proxies
- Prueba manualmente: `curl -x socks5://proxy:port https://kick.com`

### Problema: Workers no se conectan

**Soluciones**:
1. Verifica que el canal esté en vivo
2. Verifica conectividad de internet
3. Reduce el número de viewers (puede ser rate limiting)
4. Revisa los logs del servidor en la terminal

### Problema: Uso alto de memoria

**Soluciones**:
1. Reduce viewers concurrentes
2. Aumenta duración entre tests
3. Reinicia el servidor periódicamente
4. Considera actualizar hardware

### Problema: Cuentas no funcionan

**Soluciones**:
1. Verifica formato JSON en `accounts.json`
2. Verifica que los tokens sean válidos (no expirados)
3. Verifica que `isActive: true`
4. Reinicia el servidor después de cambiar cuentas

### Problema: Error "concurrently not found" (Windows 11)

**Solución**:
Ejecuta en dos terminales separadas:
```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

---

## 🏗️ Arquitectura Técnica

```
Frontend (React + TypeScript + TailwindCSS)
    ↓ Socket.IO (Real-time communication)
Backend (Express + Node.js)
    ↓ Worker Threads (Concurrent execution)
Kick Viewer Workers
    ↓ Proxy Rotation
Kick.com API/Streams
```

### Componentes Principales

**Frontend**:
- React 18 con TypeScript
- TailwindCSS para estilos
- Socket.IO Client para tiempo real
- Lucide React para iconos

**Backend**:
- Express.js server
- Socket.IO para comunicación bidireccional
- Worker Threads para concurrencia
- Account Manager con sistema de cooldown

**Workers**:
- Un worker thread por viewer
- Conexión vía proxy con user-agent específico
- Heartbeats cada 30 segundos
- Auto-desconexión al finalizar duración

**Sistema de Proxies**:
- Soporte para HTTP, HTTPS, SOCKS4, SOCKS5
- Rotación automática
- Validación de formato
- Filtrado por compatibilidad

---

## 📊 Métricas de Rendimiento

### Indicadores de Éxito

Un sistema completamente funcional debe lograr:

- ✅ **Tasa de éxito**: >90% viewers se conectan
- ✅ **Estabilidad**: Mantiene conexión durante toda la duración
- ✅ **Heartbeats**: >95% heartbeats exitosos
- ✅ **Escalabilidad**: Maneja 20+ viewers sin problemas
- ✅ **Limpieza**: Workers terminan sin memory leaks

### Recursos del Sistema

**Por viewer concurrente**:
- CPU: ~2-5%
- RAM: ~10-50 MB
- Red: ~1-5 KB/s

**Para 50 viewers**:
- CPU: ~100-250% (multi-core)
- RAM: ~500 MB - 2.5 GB
- Red: ~50-250 KB/s

---

## 📚 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Frontend + Backend concurrentemente
npm run dev:client       # Solo frontend (puerto 5173)
npm run dev:server       # Solo backend (puerto 3000)

# Producción
npm run build            # Construir proyecto completo
npm run build:client     # Solo construir frontend
npm run build:server     # Solo construir backend
npm start                # Iniciar en producción

# Utilidades
npm run clean            # Limpiar carpeta dist
npm run lint             # Ejecutar ESLint
```

---

## 🔒 Seguridad y Privacidad

- Las cuentas se almacenan localmente en `data/accounts.json`
- El archivo está en `.gitignore` por defecto
- Los tokens nunca se envían a servicios externos
- Toda comunicación es local o directa a Kick.com
- No se recopilan datos del usuario

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Abre un Pull Request

**Áreas de mejora bienvenidas**:
- Soporte para más plataformas de streaming
- Mejoras en evasión de detección de bots
- Optimizaciones de rendimiento
- Nuevas métricas y reportes
- Mejoras en la documentación

---

## ❓ FAQ (Preguntas Frecuentes)

**P: ¿Es legal usar esta herramienta?**  
R: Solo para testing en tus propios canales no monetizados. Inflar métricas viola los ToS de Kick.

**P: ¿Necesito cuentas de Kick?**  
R: No, puedes hacer testing completo solo con viewers anónimos.

**P: ¿Cuántos viewers puedo simular?**  
R: Depende de tus proxies y recursos. Recomendamos empezar con 10-20.

**P: ¿Por qué necesito proxies?**  
R: Para simular viewers desde diferentes IPs y evitar rate limiting.

**P: ¿Los viewers cuentan como reales en Kick?**  
R: Los viewers anónimos aparecen en el contador pero con menos peso. Los autenticados son más realistas.

**P: ¿Funciona con Twitch/YouTube?**  
R: No, está diseñado específicamente para Kick.com.

**P: ¿Cuál es la tasa de éxito con proxies públicos?**  
R: 10-30% es normal. Para mejor tasa, usa proxies premium o privados.

**P: ¿Puedo usar esto en canales monetizados?**  
R: **NO**. Esto viola los términos de servicio y es considerado fraude.

---

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## ⚠️ Disclaimer Legal

Esta herramienta se proporciona "tal cual" solo para propósitos educativos y de testing en infraestructura propia. El uso indebido puede violar los términos de servicio de Kick.com y potencialmente leyes locales. Los autores no se hacen responsables del mal uso de esta herramienta.

**Úsala bajo tu propio riesgo y responsabilidad.**

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la sección de Troubleshooting arriba
2. Verifica los logs del servidor en la terminal
3. Asegúrate de tener las últimas dependencias: `npm install`
4. Consulta la documentación completa en este README

---

Hecho con ❤️ para testing responsable de streams en Kick

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025
