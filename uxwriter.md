| Financiamiento | ¿Qué pasa si me atraso un pago? | Háblanos antes. Preferimos acomodar que sorprender. Las reglas te las explicamos al firmar, en español y por escrito. |
| Requisitos | ¿Puedo sacar el seguro a mi nombre? | El carro sale a tu nombre. El seguro también puede ir a tu nombre; si todavía no lo tienes, te decimos qué necesitas antes de retirarlo. Confírmalo con Sebastián al elegir el carro. |
| Inventario | ¿Esto es lo mismo que Apolo? | No. Apolo está en Miami-Dade. Titanium South Florida / Kiko Cars está en Broward: Hollywood y alrededores. Misma familia, otra casa. |
### K. Contacto
| Elemento | Prototipo | Notas |
|----------|-----------|-------|
| Eyebrow | Contacto | OK |
| H2 | Habla con Sebastián. Te responde en minutos. | Buen tono; “minutos” = compromiso operativo — validar con negocio |
| Lead | WhatsApp primero. Llamada después. Te ayudamos a elegir el carro y la inicial. | Excelente jerarquía de canal |
| Bloque | WhatsApp y teléfono · (305) 464-8968 · WhatsApp · Llamar | OK |
| Bloque | Dónde estamos · 5800 Funston St · Hollywood, FL 33023 · Esquina · Cómo llegar → | “Esquina” parece placeholder de UI; limpiar |
| Horario | L–V 9:00 am – 7:00 pm · Sáb 10:00 am – 5:00 pm · Dom cerrado | Confirmar con negocio |
### L. Footer
| Elemento | Prototipo | Notas |
|----------|-----------|-------|
| Tagline | Tu carro, aunque no tengas Social. | Unificar con H1 |
| Sub | donde Kiko te consigue tu carro | Define rol de Kiko en marca web (§4) |
| Nav | Cómo funciona · Inventario · Financiamiento · Quiénes somos · Preguntas frecuentes · Contacto | OK |
| Visítanos | Sebastián · (305) 464-8968 | OK |
| Copyright | © 2026 Titanium South Florida. Todos los derechos reservados. | OK |
| Disclaimer EN | Prices shown reflect the amount to be financed after a 35%–45% down payment. Subject to approval. Not cash price. | **FIJO — no reescribir** |
| Disclaimer ES | Los precios publicados son el monto a financiar después de una inicial del 35%–45%. Sujeto a aprobación. No es precio de contado. | Traducción OK; mantener junto al EN |
### M. Global UI
| Elemento | Prototipo | Notas |
|----------|-----------|-------|
| FAB | WhatsApp | Label a11y: “Escribime por WhatsApp” / “WhatsApp Titanium” |
---
## 3. Strings que faltan (el prototipo aún no los tiene)
Completar en la entrega del UX writer:
| Ubicación | String necesario |
|-----------|------------------|
| Hero | CTA WhatsApp primario (además de inventario) |
| Card vehículo | Down payment visible |
| Card / detalle | Estado “Reservado” / “Disponible” |
| Inventario | Empty state sin resultados de filtro |
| Inventario | Empty state sin unidades |
| Financiamiento | Labels con auto seleccionado (inicial, cuota, nota “estimada”) |
| Detalle de auto | Página o drawer: título, precio, down, bullets, CTA, disclaimer |
| Formularios (si hay) | Labels, errores, éxito |
| 404 / error red | Mensajes humanos + teléfono |
| SEO | Meta description, OG title/description |
| Imágenes | Alt texts |
| Legal | Link privacidad / términos si aplican |
---
## 4. Decisiones de marca a cerrar antes de redactar final
Resolver con negocio (Juan / Sebastián) y dejar asentado en la guía:
1. **Trato:** ¿tuteo (“tú/tienes”) o voseo (“vos/tenés/escribime”)?  
   - Redes Kiko → voseo fuerte. Prototipo web → tuteo.  
   - Recomendación: **voseo suave en CTAs y hero** (“Escribime”, “Salí manejando”); cuerpo FAQ puede quedar neutro.
2. **Personas públicas en la web**
   - **Sebastián:** contacto WhatsApp/teléfono (305) 464-8968 — cara operativa.
   - **Kiko:** ¿marca de contenido / lotero en Broward o CTA de WhatsApp distinto?  
   - Evitar que FAQ diga Kiko y el resto Sebastián sin regla.
3. **Nombre legal vs marca**
   - UI: **Titanium South Florida**
   - Mención Apolo solo en FAQ de diferenciación (Miami-Dade vs Broward).
   - “Kiko Cars” solo si se confirma como alias público.
4. **Down payment**
   - No prometer un único “desde $2,000” sin asterisco.
   - Sedán/SUV suele $2,000; pickup $3,000; siempre “carro por carro”.
5. **SSN vs Social**
   - Elegir término principal (recomendado: **SSN**, con “Social” entre paréntesis la primera vez).
---
## 5. Prioridad de reescritura (orden de trabajo sugerido)
1. Hero + CTAs globales + FAB  
2. Cómo funciona  
3. Cards + labels de precio/down  
4. Financiamiento (empty + filled)  
5. FAQ (todas)  
6. Contacto + horarios + dirección  
7. Quiénes somos  
8. Footer / SEO / alts  
9. Detalle de vehículo (cuando exista en UI)
---
## 6. Checklist de aceptación por string
- [ ] ¿Se entiende sin ver el video de redes?  
- [ ] ¿La promesa sin SSN / pasaporte está clara arriba?  
- [ ] ¿Hay CTA de contacto real (WhatsApp o teléfono)?  
- [ ] ¿“Precio a financiar” ≠ precio de contado?  
- [ ] ¿Disclaimer presente donde hay montos?  
- [ ] ¿Trato (tú/vos) consistente en la sección?  
- [ ] ¿Sebastián vs Kiko según matriz acordada?  
- [ ] ¿Suena oral y claro, no a banco?  
- [ ] ¿Cabe en móvil sin cortar el beneficio?
---
## 7. Entregable esperado del UX Writer
Por cada sección del mapa (§1):
```
ID: hero.h1
Ubicación: Home → Hero
Prototipo: "Tu próximo carro, sin SSN."
Propuesta: "..."
Variante corta (móvil): "..."   // si aplica
CTA destino: #inventario | WhatsApp | tel:
Notas / legal: ...
```
Más un **glosario corto** (SSN, Clean Title, precio a financiar, inicial/down, financiamiento propio).
---
## 8. Datos fijos (no creativos)
| Dato | Valor |
|------|-------|
| Marca | Titanium South Florida |
| Dirección | 5800 Funston St, Hollywood, FL 33023 |
| Tel / WhatsApp | (305) 464-8968 |
| Contacto persona | Sebastián |
| Horario (prototipo) | L–V 9–7 · Sáb 10–5 · Dom cerrado |
| Disclaimer EN | Prices shown reflect the amount to be financed after a 35%–45% down payment. Subject to approval. Not cash price. |
---
## 9. Resumen ejecutivo para el writer
El prototipo ya tiene buena arquitectura de mensaje: **sin SSN → pasaporte/licencia → clean title → inicial → salir manejando**.  
El trabajo no es inventar la web: es **unificar voz, personas (Sebastián/Kiko), trato tú/vos, labels de precio/down y CTAs**, y completar estados vacíos + detalle de auto + SEO.
Referencia de tono ampliada: conversación de marca Titanium (cercano, oral, concreto, urgencia suave; no corporativo).