# CMS simple de Indira Terapias con Google Sheets

La web funciona aunque Google Sheets todavía no esté conectado: usa `data/content.json` como respaldo local.

## 1. Crear la planilla
Creá un Google Sheet llamado, por ejemplo, `Indira - Contenido Web` con tres pestañas exactas:

### Terapias
`activo | nombre | categoria | resumen | modalidad | duracion | precio | boton_texto | boton_url | orden`

### Formaciones
`activo | nombre | nivel | descripcion | fecha | hora | modalidad | cupos | precio | inscripcion_url | boton_texto | orden`

### Eventos
`activo | tipo | nombre | descripcion | fecha | hora | modalidad | cupos | precio | direccion | map_url | map_embed_url | inscripcion_url | boton_texto | mostrar_en_eventos | orden`

Valores recomendados para `activo`: `SI` o `NO`.

En `tipo` podés usar: `Taller`, `Círculo de Mujeres`, `Ceremonia`, `Evento privado`, `Encuentro`, etc.

## 2. Google Maps
Para cada taller o evento Alejandra puede cargar:

- `direccion`: texto visible, por ejemplo `San Lorenzo 1234, Rosario`.
- `map_url`: link normal de Google Maps. Se muestra el botón **Cómo llegar**.
- `map_embed_url`: URL de inserción de Google Maps. Si se completa, aparece el mapa dentro de la tarjeta.

Para obtener `map_embed_url`: Google Maps > Compartir > Insertar un mapa > copiar solo la URL que figura dentro de `src="..."`.

## 3. Publicar la API
Abrí `Extensiones > Apps Script`, pegá el contenido de `cms/Code.gs`, guardá y luego:

`Implementar > Nueva implementación > Aplicación web`

- Ejecutar como: vos.
- Quién tiene acceso: Cualquiera.

Copiá la URL terminada en `/exec`.

## 4. Conectar la web
Abrí `js/cms-config.js` y pegá la URL:

```js
window.INDIRA_CMS = {
  endpoint: 'https://script.google.com/macros/s/XXXX/exec',
  whatsapp: '549341XXXXXXXX',
  fallbackUrl: './data/content.json'
};
```

## 5. Qué actualiza cada pestaña
- Terapias: sección `Propuestas actuales` en `terapias.html`.
- Formaciones: sección `Próximas formaciones y talleres` en `escuela-indira.html`.
- Eventos: talleres y encuentros en `experiencias.html`.
- Eventos cuyo `tipo` contenga `Círculo`: sección de próximos círculos en `camino-femenino.html`.
- La Home puede mostrar próximos encuentros desde la misma pestaña Eventos.

El contenido institucional completo permanece fijo en los HTML. La planilla administra únicamente la información que cambia con frecuencia.
