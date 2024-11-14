# ExperienciaPaciente

## Estado de situación
Actualmente las personas acceden, en el mejor de los casos, a una historia de salud fragmentada y condicionada por diversos factores como: la entidad que gestiona los datos, la disponibilidad tecnológica, la predisposición del equipo médico/administrativo y las propias políticas del ámbito en el cual se realiza el registro.

## Objetivo principal
Que todo ciudadano pueda acceder a sus datos de Salud.

## Premisas
- Fomentar la autogestión de datos de salud por parte de la ciudadanía.
- Descentralizar el manejo restrictivo y arbitrario de la información de salud de las personas (actualmente en un circuito limitado entre entidades públicas y privadas).
- Proveer herramientas digitales que permitan cumplir las premisas anteriores.
- Sin sesgos económicos, dado que no responde al mercado.
- Sin sesgos políticos ya que no responde a ningún gobierno.

## Esencia
Es una iniciativa con un propósito claramente social, con un fuerte componente tecnológico; y que esencialmente se basa en la premisa de que muchos de los procesos actuales de atención dentro del sistema de salud son deficitarios, retrógrados y principalmente, que no están alineados con las necesidades reales del paciente.

## El “qué”
Construir puentes entre las entidades tradicionales y una aplicación digital que organiza y posibilita su acceso.

## El “Cómo”
Mediante un conjunto de aplicaciones digitales orientadas a disponibilizar los registros de salud a quienes realmente le pertenecen… los pacientes:

### Portal del paciente (app Angular)
Crea, recibe, almacena y categoriza registros de salud independientemente de su origen (una institución pública, una entidad privada, un profesional particular, un auto-registro del paciente o familiar).

### Portal equipo de salud (extensión Chrome)
Funciona como nexo entre los sistemas propios de las entidades que actualmente generan y administran dichos datos de salud (entidades de salud, obras sociales, farmacias, profesionales particulares, etc) y el portal del paciente.

## Funcionamiento (paso por paso)
**Contexto**: Paciente interactuando con el sistema de Salud (ya sea sacando un turno desde una ventanilla de un hospital, consultando un particular, comprando un medicamento en una farmacia o internado en una clínica privada).

1. Con la extensión Chrome de experienciaPaciente instalada y activa en el navegador de la entidad (hospital, clínica, obra social, farmacia), cada registro realizado a través de uno de sus formularios, será recolectado y almacenado en el localStorage del navegador, generando a su vez, un código QR del registro (de la consulta, parte médico, receta, etc).
2. El paciente abre la app de experienciaPaciente en su dispositivo, scanea el código generado desde la extensión Chrome de la entidad y guarda sus datos en su Historia de Salud.
