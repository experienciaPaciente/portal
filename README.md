# ExperienciaPaciente | portal-paciente

## Descripción
ExperienciaPaciente es una iniciativa de base tecnológica y propósito social, orientada a otorgar a cada ciudadano el control y acceso directo a su historial de salud. Actualmente, el acceso a los registros de salud es limitado y fragmentado, condicionado por múltiples factores, como la entidad que gestiona los datos, la tecnología disponible y las políticas de la institución que realiza el registro. Este proyecto busca transformar ese panorama, facilitando la autogestión y descentralización de la información de salud de cada paciente, independiente de entidades públicas o privadas, sin responder a sesgos económicos o políticos.

## Objetivo principal
Permitir que todo ciudadano pueda acceder de manera autónoma a sus datos de salud.

## Premisas
- **Autogestión**: Empoderar a los ciudadanos para que gestionen sus propios datos de salud.
- **Descentralización**: Reducir el control restrictivo y arbitrario de la información de salud, actualmente en manos de entidades públicas y privadas.
- **Herramientas digitales**: Proveer plataformas y aplicaciones para cumplir los principios anteriores.
- **Neutralidad**: Sin influencias de intereses económicos o políticos.

## Esencia del proyecto
ExperienciaPaciente se basa en la premisa de que el sistema de salud actual presenta deficiencias y carece de alineación con las verdaderas necesidades del paciente. Este proyecto, por tanto, busca construir puentes entre las entidades tradicionales de salud y una aplicación digital accesible para cada ciudadano.

## Componentes principales

### Portal del Paciente (App en Angular)
- Función: Permite a los pacientes crear, recibir, almacenar y organizar sus registros de salud, independientemente del origen de los mismos.
- Características: Los datos pueden provenir de instituciones públicas, entidades privadas, profesionales particulares o de un auto-registro realizado por el propio paciente o su familia.

### Portal Equipo de Salud (Extensión Chrome)
- Función: Actúa como un enlace entre los sistemas de salud de las entidades que generan y gestionan datos de salud (hospitales, clínicas, farmacias, etc.) y el Portal del Paciente.
- Características: La extensión permite registrar automáticamente información en el navegador de la entidad y generar un código QR para que el paciente pueda transferir sus datos a la app de ExperienciaPaciente.

## Funcionamiento

1. **Contexto**: El paciente se encuentra interactuando con el sistema de salud, ya sea en una consulta, en una compra de medicamento en una farmacia o en una clínica.
2. **Registro de datos**: Cuando el equipo de salud realiza un registro de la consulta o transacción mediante un formulario, la extensión Chrome de ExperienciaPaciente guarda la información en el `localStorage` del navegador y genera un código QR para el registro.
3. **Transferencia de datos**: El paciente escanea el código QR con la app de ExperienciaPaciente en su dispositivo, integrando ese registro en su historia de salud.

## Cómo contribuir
Si deseas contribuir a ExperienciaPaciente, por favor revisa nuestras guías de contribución en este repositorio, incluyendo lineamientos para desarrollo de software y pruebas de seguridad y privacidad.

## Licencia
Este proyecto se encuentra bajo una licencia de software de código abierto para fomentar la transparencia y accesibilidad en el acceso a la salud. Ver el archivo `LICENSE` para más detalles.

---

Este proyecto es parte de un esfuerzo por una transformación social en el ámbito de la salud, priorizando el bienestar y los derechos de cada ciudadano.
