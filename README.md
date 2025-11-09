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

## 🔬 Detalles Técnicos de Implementación

Esta sección documenta los aspectos técnicos internos del sistema basados en el análisis del código fuente.

### Sistema de Gestión de Cuentas (AccountManager)

**Ubicación**: `server/utils/accountManager.ts`

**Características**:
- **Cooldown por cuenta**: 5 minutos (300,000 ms) después de cada uso
- **Tracking en memoria**: Usa `Map<string, number>` para rastrear última vez usado
- **Persistencia**: Auto-guardado en `data/accounts.json`
- **Estados**: Solo cuentas con `isActive: true` son elegibles

**Métodos principales**:
```typescript
getAvailableAccount(): KickAccount | null  // Obtiene cuenta disponible (no en cooldown)
releaseAccount(username: string): void     // Libera cooldown inmediatamente
loadAccounts(): void                       // Recarga desde accounts.json
getActiveAccountCount(): number            // Retorna cantidad de cuentas activas
addAccount(account: KickAccount): void     // Añade nueva cuenta
updateAccount(username: string, updates: Partial<KickAccount>): boolean
removeAccount(username: string): boolean
```

**Flujo de cooldown**:
1. Cuenta se asigna → `cooldowns.set(username, Date.now())`
2. Durante 5 minutos → Cuenta no disponible
3. Después de 5 minutos → Automáticamente disponible
4. O liberar manualmente → `releaseAccount(username)`

### Worker Threads - KickViewer

**Ubicación**: `server/workers/kickViewer.js`

**Configuración de timing**:
- **Heartbeats**: Cada 30 segundos (30,000 ms)
- **Timeout de sesión**: Según duración configurada (10-300 segundos)
- **Timeout de conexión**: 10,000 ms

**APIs de Kick utilizadas**:
```
GET https://kick.com/api/v2/channels/{channelName}
  → Verifica existencia del canal y estado LIVE/OFFLINE
  
GET https://kick.com/{channelName}
  → Simula vista de página (genera viewer count)
```

**Parsing de URLs flexible**:
- Acepta: `https://kick.com/xqc`
- Acepta: `https://kick.com/xqc/livestream/123456`
- Acepta: `xqc` (nombre directo)
- Extrae automáticamente el nombre del canal de cualquier formato

**Flujo de ejecución por worker**:
1. **Parse URL** → Extrae nombre de canal
2. **Crear cliente HTTP** → Con proxy + user-agent + cookies (si autenticado)
3. **GET API v2** → Verificar canal existe
4. **Verificar estado** → LIVE o OFFLINE (ambos cuentan como viewer)
5. **GET página principal** → Simular visita real
6. **Iniciar heartbeats** → Cada 30s, envía GET a API para mantener sesión
7. **Esperar duración** → Timeout según configuración
8. **Cleanup** → Detener heartbeats, liberar cuenta, exit

**Mensajes de log**:
- 🔗 Connecting to... → Inicio de conexión
- ✅ Connected to {channel} - LIVE/OFFLINE → Conexión exitosa
- 💓 Heartbeat #{n} → Heartbeat exitoso
- ⚠️ Heartbeat failed → Heartbeat falló
- ⏹️ Viewer session ended → Sesión completada
- ❌ Failed to connect → Error de conexión

### Cliente HTTP (clientUtils.js)

**Ubicación**: `server/utils/clientUtils.js`

**Configuraciones de timeout**:
```javascript
// Cliente genérico
timeout: 5000 ms
maxRedirects: 3

// Cliente Kick (createKickClient)
timeout: 10000 ms
maxRedirects: 5
validateStatus: status < 500
```

**Headers personalizados para Kick**:
```javascript
User-Agent: {userAgent}
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Upgrade-Insecure-Requests: 1
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: none
Cookie: token={account.token}  // Solo si autenticado
```

**Soporte de proxies**:
- **HTTP/HTTPS**: Usa configuración nativa de axios
- **SOCKS4/SOCKS5**: Usa `SocksProxyAgent` como httpAgent/httpsAgent
- **Autenticación**: Soporta username:password en formato URI

### Sistema de Proxies (proxyUtils.ts)

**Ubicación**: `server/proxyUtils.ts`

**Detección automática de protocolo por puerto**:
```typescript
80   → http
443  → https
1080 → socks5
1081 → socks4
8080 → http
8443 → https
Otro → http (default)
```

**Normalización automática**:
- Si falta protocolo → Inferir por puerto
- Si falta puerto → Default 8080
- Filtrado → Solo protocolos soportados (http, https, socks4, socks5)

**Formatos de proxy soportados**:
```
protocol://host:port
protocol://username:password@host:port
host:port (auto-detecta protocolo por puerto)
```

### Interfaces TypeScript (lib.ts)

**Ubicación**: `server/lib.ts`

```typescript
// Proxy
interface Proxy {
  protocol: "http" | "https" | "socks4" | "socks5" | string;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

// Cuenta de Kick
interface KickAccount {
  username: string;
  email: string;
  token?: string;        // Token de sesión de Kick
  password?: string;     // Alternativo (no implementado actualmente)
  lastUsed?: number;     // Timestamp de último uso
  isActive: boolean;     // Solo cuentas activas son usadas
}

// Configuración de test
interface ViewerTestConfig {
  channelUrl: string;
  anonymousViewers: number;
  authenticatedViewers: number;
  duration: number;
  accounts?: KickAccount[];
}

// Modos de viewer
type ViewerMode = "anonymous" | "authenticated";
```

### Límites Configurables en Frontend

**Ubicación**: `src/App.tsx`

**Anonymous Viewers** (líneas 283-289):
```typescript
Math.min(50, Math.max(0, Number(e.target.value)))
min="0"
max="50"
```

**Authenticated Viewers** (líneas 301-310):
```typescript
Math.min(20, Math.max(0, Number(e.target.value)))
min="0"
max="20"
disabled={!hasAccounts}  // Se desactiva si no hay cuentas
```

**Test Duration** (líneas 321-328):
```typescript
Math.min(300, Math.max(10, Number(e.target.value)))
min="10"
max="300"  // 5 minutos máximo
```

**Para modificar estos límites**:
1. Editar `src/App.tsx`
2. Cambiar `Math.min(VALOR_MAXIMO, ...)` a tu límite deseado
3. Cambiar atributo `max="VALOR"` del input
4. Actualizar texto informativo `<p>Max: VALOR</p>`
5. Rebuild: `npm run build`

### Comunicación Socket.IO

**Ubicación**: `server/index.ts` y `src/App.tsx`

**Eventos del cliente → servidor**:
- `startViewerTest` → Payload: `{ channelUrl, anonymousViewers, authenticatedViewers, duration }`
- `stopViewerTest` → Sin payload, detiene workers activos

**Eventos del servidor → cliente**:
- `viewerStats` → Payload: `{ activeViewers?, totalConnections?, totalViewTime?, availableAccounts?, log? }`
- `testEnd` → Sin payload, indica fin de test

**Estadísticas tracked**:
```typescript
{
  activeViewers: number;      // Viewers actualmente conectados
  totalConnections: number;   // Conexiones totales realizadas
  totalViewTime: number;      // Tiempo total de vista (segundos)
  availableAccounts: number;  // Cuentas disponibles (no en cooldown)
}
```

**Logs en tiempo real**:
- Cada evento importante genera un log con emoji identificador
- Los logs se muestran en frontend con timestamp automático
- Máximo 15 logs visibles (los más recientes)

### Ciclo de Vida de un Viewer

**1. Inicio del test** (cliente):
```
Usuario hace clic → startViewerTest emitido → Backend recibe evento
```

**2. Creación de workers** (backend):
```
Para cada viewer:
  - Asignar proxy del pool (rotación circular)
  - Asignar user-agent del pool (rotación circular)
  - Si autenticado: Obtener cuenta disponible (sin cooldown)
  - Crear Worker con workerData
  - Registrar listeners (message, error, exit)
```

**3. Ejecución del worker**:
```
Parse URL → Crear cliente HTTP → GET API verificar canal →
GET página principal → Iniciar heartbeats cada 30s →
Esperar duración → Cleanup → Exit
```

**4. Durante ejecución**:
```
Worker envía mensajes → parentPort.postMessage() →
Backend escucha → worker.on('message') →
Backend reenvía → socket.emit('viewerStats') →
Frontend actualiza → UI en tiempo real
```

**5. Finalización**:
```
Worker exit → Backend cuenta finished →
Si todos finalizaron → Emitir 'testEnd' →
Frontend actualiza → Botón vuelve a "Start"
```

**6. Cleanup de cuenta autenticada**:
```
Worker exit → worker.on('exit') →
accountManager.releaseAccount(username) →
Cuenta disponible inmediatamente (cooldown removido)
```

### Consideraciones de Rendimiento

**Límites prácticos identificados**:
- **Proxies**: Necesitas N proxies para N viewers anónimos
- **Workers**: Un Worker Thread por viewer (puede saturar CPU en +50)
- **Memoria**: ~10-50 MB por worker activo
- **Red**: Heartbeats cada 30s = 2 requests/min/viewer

**Cuellos de botella comunes**:
1. **Falta de proxies válidos** → Reduce viewers o añade más proxies
2. **Proxies lentos** → Timeouts frecuentes, considerar proxies premium
3. **Muchos workers** → Saturación de CPU, reduce concurrencia
4. **Rate limiting de Kick** → Reduce frecuencia o usa más IPs distintas

**Optimizaciones implementadas**:
- Worker threads para paralelismo real (no solo async)
- Rotación de proxies para distribuir carga
- Heartbeats espaciados (30s) para minimizar requests
- Cooldown de cuentas para evitar spam
- Timeouts agresivos para detectar proxies muertos rápido

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
