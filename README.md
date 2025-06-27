# Módulo Últimos Productos - Odoo 13

## Descripción

Este módulo permite mostrar los productos más recientes en el sitio web de Odoo, con la capacidad de filtrar por listas de precios específicas.

## Características

### ✅ Funcionalidades Implementadas

- **Filtrado por Lista de Precios**: El snippet ahora filtra correctamente los productos según la lista de precios configurada
- **Configuración Dinámica**: Permite cambiar la lista de precios desde el editor web
- **Carga Asíncrona**: Los productos se cargan dinámicamente via JavaScript para mejor rendimiento
- **Precios Correctos**: Muestra los precios según la lista de precios seleccionada
- **Carrito Funcional**: Botones de "Añadir al carrito" funcionan correctamente

### 🔧 Problema Solucionado

**Problema Original**: El snippet mostraba todos los productos publicados en lugar de filtrar por la lista de precios específica.

**Solución Implementada**:
1. Eliminación de la consulta directa en el template XML
2. Implementación de carga dinámica via controlador
3. Filtrado correcto por lista de precios en el backend
4. Opciones configurables desde el editor web

## Uso

### 1. Instalación
1. Coloca el módulo en la carpeta `addons`
2. Actualiza la lista de módulos
3. Instala el módulo "Ultimos Productos"

### 2. Configuración
1. Ve al editor web de tu sitio
2. Arrastra y suelta el snippet "Últimos Productos"
3. Haz clic derecho en el snippet para acceder a las opciones
4. Selecciona la lista de precios deseada:
   - **Lista Principal**: Muestra solo productos de la lista de precios ID 1573
   - **Todos los Productos**: Muestra todos los productos publicados

### 3. Personalización

Para agregar más listas de precios:

1. Edita el archivo `views/snippet_options.xml`
2. Agrega nuevas opciones en el menú desplegable:

```xml
<li><a href="#" class="dropdown-item" data-pricelist-id="TU_ID_LISTA">Nombre de tu Lista</a></li>
```

## Estructura del Módulo

```
latest_products/
├── __init__.py
├── __manifest__.py
├── README.md
├── latest_products/
│   └── controllers.py          # Controlador para obtener productos filtrados
├── static/src/
│   ├── js/
│   │   ├── main.js            # Widget principal del snippet
│   │   ├── snippet.js         # Animaciones del snippet
│   │   └── snippet_options.js # Opciones del editor web
│   └── scss/
│       └── style.scss         # Estilos CSS
└── views/
    ├── assets.xml             # Inclusión de archivos CSS/JS
    ├── snippet_options.xml    # Opciones del snippet en el editor
    └── snippets.xml           # Template del snippet
```

## Archivos Modificados

### 1. `views/snippets.xml`
- ✅ Eliminada la consulta directa a productos
- ✅ Agregado spinner de carga
- ✅ Agregado atributo `data-pricelist-id`

### 2. `latest_products/controllers.py`
- ✅ Agregado parámetro `pricelist_id`
- ✅ Lógica para manejar "todos los productos" (ID 0)
- ✅ Retorno del `variant_id` para el carrito

### 3. `static/src/js/main.js`
- ✅ Uso del `variant_id` correcto para el carrito
- ✅ Lectura del atributo `data-pricelist-id`
- ✅ Inclusión del token CSRF

### 4. `views/snippet_options.xml`
- ✅ Opciones para seleccionar lista de precios
- ✅ Selector correcto `.mi_snippet_latest_products`

### 5. `views/assets.xml`
- ✅ Inclusión del archivo `snippet_options.js`

## Archivos Nuevos

### 1. `static/src/js/snippet_options.js`
- ✅ Manejo de opciones del snippet en el editor
- ✅ Recarga dinámica de productos al cambiar lista de precios

### 2. `README.md`
- ✅ Documentación completa del módulo

## Configuración Técnica

### Lista de Precios por Defecto
- **ID**: 1573
- **Modificable**: Sí, desde el editor web o cambiando el valor por defecto en el código

### Límite de Productos
- **Cantidad**: 8 productos máximo
- **Orden**: Por fecha de creación (más recientes primero)

## Solución de Problemas

### El snippet no muestra productos
1. Verifica que la lista de precios existe y tiene productos asignados
2. Asegúrate de que los productos están publicados en el website
3. Revisa la consola del navegador para errores JavaScript

### Los precios no son correctos
1. Verifica que la lista de precios tiene reglas configuradas
2. Asegúrate de que los productos tienen variantes activas

### El botón "Añadir al carrito" no funciona
1. Verifica que el token CSRF está presente en la página
2. Asegúrate de que el producto tiene variantes disponibles

## Autor

- **Desarrollador Original**: Lorenzo Romero
- **Mejoras y Correcciones**: Arquitecto de Software AI
- **Versión**: 13.0.1.0.0