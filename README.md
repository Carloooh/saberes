0 - Recuperación de contraseña del usuario

1 - en portalDocente/[id]/page.tsx quitar le botón agregar asistencia, dejar el total alumnos, total dias de asistencia y la último día de asistencia registrada, poner tab de listado de estudiantes y otra de asistencia, esos 2 seran componentes, en asistencia pues la mimssma lógica que ya tengo que agregar día y en otra poner el listado de estudiantes, y que al clicar, me lleve en otra ventana a /perfil/rut_usuario. Vamos a utilizar los componentes components/docente/TabAsistencia.tsx y components/docente/TabEstudiantes.tsx, la página portalDocente/[id]/page.tsx

2 - Si el estudiante cambia de curso se tienen que borrar sus registros de asistencia/entregas de tareas/calificaciones / Tal vez poner opcion de cambiar de curso en el listado de estudiantes pero le dejamos la info al administrador solamente mejor, y si un alumno es de tercero advertir que el usuario es de último año y solo se puede cambiar su estado a "Egresado" o eliminarlo del sistema

// https://www.youtube.com/watch?v=7tpco9Fplsg con brevo

// https://www.youtube.com/watch?v=ANQfJrKIPGU

// https://www.nodemailer.com/

// https://react.email/docs/introduction
// https://demo.react.email/preview/magic-links/plaid-verify-identity
