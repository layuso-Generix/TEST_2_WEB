# Facturas JSON · Perfil GNX SPFE

## Probar el portal en local

Desde la carpeta que contiene `index.html`, ejecuta:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

- [Ver los campos del esquema](http://127.0.0.1:8000/json-einvoicing.html#estructura). Busca `ThirdParty` para ver el tipo lista y abre **Ver condiciones** para consultar cuándo se informa y cuándo se omite.
- [Validar una factura](http://127.0.0.1:8000/response-einvoicing.html#validacion-invoice). Pulsa **Probar con una factura de ejemplo**, selecciona un archivo propio o arrástralo al recuadro. Los errores muestran la ruta; al pulsar una fila se resalta el campo en el JSON. Si falta la propiedad, se señala su objeto padre.
- [Descargar ejemplos](http://127.0.0.1:8000/json-einvoicing.html#ejemplos). Hay tres facturas ficticias válidas. Para una prueba negativa, en el ejemplo de tercero cambia `"ThirdParty": [{…}]` por `"ThirdParty": {…}` sin alterar los datos del tercero. Debe fallar en esa propiedad: se esperaba una lista.

## Integración

El sitio es estático y se puede servir desde un subdirectorio, por ejemplo en GitHub Pages. Sube los **contenidos** de la carpeta del proyecto manteniendo su estructura. No es necesario compilar ni instalar paquetes para usar el portal. Ábrelo por HTTP(S); el doble clic en un HTML no sirve para cargar los módulos y el esquema de manera fiable.

El visor y `validator.js` comparten la ruta definida en `Assets/spfe/config.mjs`: `E-invoicing/Standard/Invoice/Json/GNX_Invoice_SPFE.schema.json`. El contrato anterior y sus ejemplos se conservan en **Versiones**. La pestaña **Enumeraciones** obtiene los valores y sus restricciones del esquema; `Assets/spfe/significados.json` aporta las etiquetas en español.

La validación usa Ajv 8.17.1 y ajv-formats 2.1.1, que el navegador descarga de jsDelivr cuando se valida por primera vez. La factura se procesa en el navegador; no se envía a un servidor. Si falta el esquema o el navegador no puede cargar una dependencia, aparece **No se ha podido validar**; eso no significa que la factura sea incorrecta. Este validador comprueba el contrato GNX, no la aceptación de la factura por la AEAT.

Para ejecutar las pruebas de la visualización y la localización de errores con Node 20 o superior: `node --test tests/gnx-json.test.mjs`.
