# Documentación para el Frontend

## Descripción General

Esta API proporciona endpoints para una plataforma de mensajes anónimos donde los usuarios pueden registrarse, iniciar sesión, enviar y recibir mensajes anónimos. También incluye soporte para WebSockets para notificaciones en tiempo real.

## Autenticación

La API utiliza autenticación basada en tokens JWT. Para las rutas protegidas, debes incluir el token en el encabezado de autorización:

```
Authorization: Bearer <token>
```

## Endpoints

### Usuarios

#### Registro de Usuario

- **URL**: `/register`
- **Método**: `POST`
- **Autenticación**: No requerida
- **Cuerpo de la Solicitud**:
  ```json
  {
    "username": "usuario123",
    "password": "contraseña123"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "id": 1,
    "username": "usuario123"
  }
  ```

#### Inicio de Sesión

- **URL**: `/login`
- **Método**: `POST`
- **Autenticación**: No requerida
- **Cuerpo de la Solicitud**:
  ```json
  {
    "username": "usuario123",
    "password": "contraseña123"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Mensajes

#### Enviar un Mensaje

- **URL**: `/messages/{username}`
- **Método**: `POST`
- **Autenticación**: No requerida
- **Cuerpo de la Solicitud**:
  ```json
  {
    "content": "¡Hola! Este es un mensaje anónimo."
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "id": 1,
    "receiver_username": "usuario123",
    "content": "¡Hola! Este es un mensaje anónimo.",
    "created_at": "Mon, 01 Jan 2023 12:00:00 GMT",
    "is_read": false
  }
  ```

#### Obtener Mensajes

- **URL**: `/messages/{username}`
- **Método**: `GET`
- **Autenticación**: Requerida
- **Respuesta Exitosa**:
  ```json
  [
    {
      "id": 1,
      "receiver_username": "usuario123",
      "content": "¡Hola! Este es un mensaje anónimo.",
      "created_at": "Mon, 01 Jan 2023 12:00:00 GMT",
      "is_read": false
    },
    {
      "id": 2,
      "receiver_username": "usuario123",
      "content": "¡Otro mensaje anónimo!",
      "created_at": "Mon, 01 Jan 2023 12:05:00 GMT",
      "is_read": false
    }
  ]
  ```

#### Marcar Mensajes como Leídos

- **URL**: `/messages/{username}/read`
- **Método**: `POST`
- **Autenticación**: Requerida
- **Cuerpo de la Solicitud**:
  ```json
  {
    "message_ids": [1, 2]
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "success": true
  }
  ```

#### Obtener Contador de Mensajes No Leídos

- **URL**: `/messages/{username}/unread`
- **Método**: `GET`
- **Autenticación**: Requerida
- **Respuesta Exitosa**:
  ```json
  {
    "count": 2
  }
  ```

## WebSockets

La API proporciona soporte para WebSockets para notificaciones en tiempo real.

### Conexión WebSocket

- **URL**: `/ws?username={username}&token={token}`
- **Parámetros de Consulta**:
  - `username`: Nombre de usuario
  - `token`: Token JWT obtenido al iniciar sesión

### Mensajes WebSocket

El servidor enviará mensajes WebSocket en formato JSON con los siguientes tipos:

#### Nuevo Mensaje

```json
{
  "type": "new_message",
  "data": {
    "id": 1,
    "receiver_username": "usuario123",
    "content": "¡Hola! Este es un mensaje anónimo.",
    "created_at": "Mon, 01 Jan 2023 12:00:00 GMT",
    "is_read": false
  }
}
```

#### Contador de Mensajes No Leídos

```json
{
  "type": "unread_count",
  "data": {
    "count": 2
  }
}
```

## Implementación en el Frontend

### Autenticación

1. Almacena el token JWT en localStorage o sessionStorage después de iniciar sesión.
2. Incluye el token en todas las solicitudes a endpoints protegidos.

### Notificaciones en Tiempo Real

1. Establece una conexión WebSocket después de iniciar sesión.
2. Escucha los mensajes WebSocket para actualizar la interfaz de usuario en tiempo real.
3. Muestra un contador de notificaciones para mensajes no leídos.

### Ejemplo de Conexión WebSocket

```javascript
// Establecer conexión WebSocket
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
const ws = new WebSocket(`ws://localhost:8080/ws?username=${username}&token=${token}`);

// Escuchar mensajes
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'new_message') {
    // Actualizar la lista de mensajes
    console.log('Nuevo mensaje:', message.data);
    // Actualizar la interfaz de usuario
  } else if (message.type === 'unread_count') {
    // Actualizar el contador de mensajes no leídos
    console.log('Mensajes no leídos:', message.data.count);
    // Actualizar la interfaz de usuario
  }
};

// Manejar errores y reconexiones
ws.onerror = (error) => {
  console.error('Error en la conexión WebSocket:', error);
};

ws.onclose = () => {
  console.log('Conexión WebSocket cerrada. Intentando reconectar...');
  // Implementar lógica de reconexión
};
```

## Notas Adicionales

- La API está diseñada para ser RESTful y seguir las mejores prácticas.
- Todos los endpoints devuelven respuestas JSON.
- Los errores se devuelven con códigos de estado HTTP apropiados y mensajes de error descriptivos.
- La autenticación es requerida para acceder a los mensajes de un usuario, pero no para enviar mensajes anónimos.
- Las notificaciones en tiempo real se envían a través de WebSockets para proporcionar una experiencia de usuario más interactiva.