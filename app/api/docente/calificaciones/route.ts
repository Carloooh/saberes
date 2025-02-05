// import { NextResponse } from "next/server";
// import db from "@/db";

// // Definir interfaces para los tipos de datos
// interface Estudiante {
//   email: string;
//   nombre: string;
// }

// interface Calificacion {
//   id_usuario: string;
//   calificaciones: string; // JSON string
// }

// interface CalificacionParsed {
//   prueba: string;
//   fecha: string;
//   nota: number;
// }

// // GET: Obtener estudiantes y calificaciones por curso y asignatura
// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const cursoId = searchParams.get("cursoId");
//     const asignaturaId = searchParams.get("asignaturaId");

//     if (!cursoId || !asignaturaId) {
//       return NextResponse.json(
//         { success: false, error: "Faltan parámetros requeridos" },
//         { status: 400 }
//       );
//     }

//     // Obtener estudiantes del curso
//     const stmtEstudiantes = db.prepare(`
//       SELECT email, nombre FROM Usuario
//       WHERE tipo_usuario = 'Estudiante' AND cursos LIKE ?
//     `);
//     const estudiantes: Estudiante[] = stmtEstudiantes.all(`%${cursoId}%`) as Estudiante[];

//     // Obtener calificaciones de los estudiantes para la asignatura
//     const stmtCalificaciones = db.prepare(`
//       SELECT id_usuario, calificaciones FROM Calificacion
//       WHERE id_asignatura = ?
//     `);
//     const calificaciones: Calificacion[] = stmtCalificaciones.all(asignaturaId) as Calificacion[];

//     // Combinar estudiantes con sus calificaciones
//     const estudiantesConCalificaciones = estudiantes.map((estudiante) => {
//       const calificacionEstudiante = calificaciones.find(
//         (cal) => cal.id_usuario === estudiante.email
//       );
//       return {
//         ...estudiante,
//         calificaciones: calificacionEstudiante
//           ? (JSON.parse(calificacionEstudiante.calificaciones) as CalificacionParsed[])
//           : [],
//       };
//     });

//     return NextResponse.json({ success: true, data: estudiantesConCalificaciones }, { status: 200 });
//   } catch (error) {
//     console.error("Error al obtener los estudiantes y calificaciones:", error);
//     return NextResponse.json(
//       { success: false, error: "Error en el servidor" },
//       { status: 500 }
//     );
//   }
// }

// // POST: Agregar una calificación
// export async function POST(request: Request) {
//   try {
//     const { id_usuario, id_asignatura, calificacion } = await request.json();

//     if (!id_usuario || !id_asignatura || !calificacion) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     // Obtener las calificaciones actuales del estudiante
//     const stmtGet = db.prepare(`
//       SELECT calificaciones FROM Calificacion
//       WHERE id_usuario = ? AND id_asignatura = ?
//     `);
//     const calificacionesActuales = stmtGet.get(id_usuario, id_asignatura) as { calificaciones: string } | undefined;

//     // Crear un nuevo registro o actualizar el existente
//     const nuevaCalificacion: CalificacionParsed = {
//       prueba: `Prueba ${
//         calificacionesActuales ? JSON.parse(calificacionesActuales.calificaciones).length + 1 : 1
//       }`,
//       fecha: new Date().toISOString(),
//       nota: calificacion,
//     };

//     const calificacionesActualizadas: CalificacionParsed[] = calificacionesActuales
//       ? [...JSON.parse(calificacionesActuales.calificaciones), nuevaCalificacion]
//       : [nuevaCalificacion];

//     const stmtInsert = db.prepare(`
//       INSERT OR REPLACE INTO Calificacion (id_calificaciones, id_usuario, id_asignatura, calificaciones)
//       VALUES (?, ?, ?, ?)
//     `);
//     const id_calificaciones = crypto.randomUUID(); // Generar un ID único
//     stmtInsert.run(
//       id_calificaciones,
//       id_usuario,
//       id_asignatura,
//       JSON.stringify(calificacionesActualizadas)
//     );

//     return NextResponse.json({ success: true }, { status: 201 });
//   } catch (error) {
//     console.error("Error al agregar la calificación:", error);
//     return NextResponse.json(
//       { success: false, error: "Error en el servidor" },
//       { status: 500 }
//     );
//   }
// }

// // PUT: Actualizar una calificación
// export async function PUT(request: Request) {
//   try {
//     const { id_usuario, id_asignatura, calificacion, prueba } = await request.json();

//     if (!id_usuario || !id_asignatura || !calificacion || !prueba) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     // Obtener las calificaciones actuales del estudiante
//     const stmtGet = db.prepare(`
//       SELECT calificaciones FROM Calificacion
//       WHERE id_usuario = ? AND id_asignatura = ?
//     `);
//     const calificacionesActuales = stmtGet.get(id_usuario, id_asignatura) as { calificaciones: string } | undefined;

//     if (!calificacionesActuales) {
//       return NextResponse.json(
//         { success: false, error: "No se encontraron calificaciones para el estudiante y asignatura especificados" },
//         { status: 404 }
//       );
//     }

//     // Actualizar la calificación específica
//     const calificacionesParsed: CalificacionParsed[] = JSON.parse(calificacionesActuales.calificaciones);
//     const calificacionIndex = calificacionesParsed.findIndex((cal) => cal.prueba === prueba);

//     if (calificacionIndex === -1) {
//       return NextResponse.json(
//         { success: false, error: "No se encontró la prueba especificada" },
//         { status: 404 }
//       );
//     }

//     calificacionesParsed[calificacionIndex].nota = calificacion;

//     const stmtUpdate = db.prepare(`
//       UPDATE Calificacion
//       SET calificaciones = ?
//       WHERE id_usuario = ? AND id_asignatura = ?
//     `);
//     stmtUpdate.run(
//       JSON.stringify(calificacionesParsed),
//       id_usuario,
//       id_asignatura
//     );

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Error al actualizar la calificación:", error);
//     return NextResponse.json(
//       { success: false, error: "Error en el servidor" },
//       { status: 500 }
//     );
//   }
// }

// // DELETE: Eliminar una calificación
// export async function DELETE(request: Request) {
//   try {
//     const { id_usuario, id_asignatura, prueba } = await request.json();

//     if (!id_usuario || !id_asignatura || !prueba) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     // Obtener las calificaciones actuales del estudiante
//     const stmtGet = db.prepare(`
//       SELECT calificaciones FROM Calificacion
//       WHERE id_usuario = ? AND id_asignatura = ?
//     `);
//     const calificacionesActuales = stmtGet.get(id_usuario, id_asignatura) as { calificaciones: string } | undefined;

//     if (!calificacionesActuales) {
//       return NextResponse.json(
//         { success: false, error: "No se encontraron calificaciones para el estudiante y asignatura especificados" },
//         { status: 404 }
//       );
//     }

//     // Eliminar la calificación específica
//     const calificacionesParsed: CalificacionParsed[] = JSON.parse(calificacionesActuales.calificaciones);
//     const calificacionesFiltradas = calificacionesParsed.filter((cal) => cal.prueba !== prueba);

//     const stmtUpdate = db.prepare(`
//       UPDATE Calificacion
//       SET calificaciones = ?
//       WHERE id_usuario = ? AND id_asignatura = ?
//     `);
//     stmtUpdate.run(
//       JSON.stringify(calificacionesFiltradas),
//       id_usuario,
//       id_asignatura
//     );

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Error al eliminar la calificación:", error);
//     return NextResponse.json(
//       { success: false, error: "Error en el servidor" },
//       { status: 500 }
//     );
//   }
// }
















import { NextResponse } from "next/server";
import db from "@/db";

// Definir interfaces para los tipos de datos
interface Estudiante {
  email: string;
  nombre: string;
}

interface Calificacion {
  id_usuario: string;
  calificaciones: string; // JSON string
}

interface CalificacionParsed {
  prueba: string;
  fecha: string;
  nota: number;
}

// GET: Obtener estudiantes y calificaciones por curso y asignatura
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get("cursoId");
    const asignaturaId = searchParams.get("asignaturaId");

    if (!cursoId || !asignaturaId) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Obtener estudiantes del curso
    const stmtEstudiantes = db.prepare(`
      SELECT email, nombre FROM Usuario
      WHERE tipo_usuario = 'Estudiante' AND cursos LIKE ?
    `);
    const estudiantes: Estudiante[] = stmtEstudiantes.all(`%${cursoId}%`) as Estudiante[];

    // Obtener calificaciones de los estudiantes para la asignatura
    const stmtCalificaciones = db.prepare(`
      SELECT id_usuario, calificaciones FROM Calificacion
      WHERE id_asignatura = ?
    `);
    const calificaciones: Calificacion[] = stmtCalificaciones.all(asignaturaId) as Calificacion[];

    // Combinar estudiantes con sus calificaciones
    const estudiantesConCalificaciones = estudiantes.map((estudiante) => {
      const calificacionEstudiante = calificaciones.find(
        (cal) => cal.id_usuario === estudiante.email
      );
      return {
        ...estudiante,
        calificaciones: calificacionEstudiante
          ? (JSON.parse(calificacionEstudiante.calificaciones) as CalificacionParsed[])
          : [],
      };
    });

    return NextResponse.json({ success: true, data: estudiantesConCalificaciones }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los estudiantes y calificaciones:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// POST: Agregar una calificación
export async function POST(request: Request) {
  try {
    const { id_usuario, id_asignatura, calificacion } = await request.json();

    if (!id_usuario || !id_asignatura || !calificacion) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Obtener las calificaciones actuales del estudiante
    const stmtGet = db.prepare(`
      SELECT calificaciones FROM Calificacion
      WHERE id_usuario = ? AND id_asignatura = ?
    `);
    const calificacionesActuales = stmtGet.get(id_usuario, id_asignatura) as { calificaciones: string } | undefined;

    // Crear un nuevo registro o actualizar el existente
    const nuevaCalificacion: CalificacionParsed = {
      prueba: `Prueba ${
        calificacionesActuales ? JSON.parse(calificacionesActuales.calificaciones).length + 1 : 1
      }`,
      fecha: new Date().toISOString(),
      nota: calificacion,
    };

    const calificacionesActualizadas: CalificacionParsed[] = calificacionesActuales
      ? [...JSON.parse(calificacionesActuales.calificaciones), nuevaCalificacion]
      : [nuevaCalificacion];

    const stmtInsert = db.prepare(`
      INSERT OR REPLACE INTO Calificacion (id_calificaciones, id_usuario, id_asignatura, calificaciones)
      VALUES (?, ?, ?, ?)
    `);
    const id_calificaciones = crypto.randomUUID(); // Generar un ID único
    stmtInsert.run(
      id_calificaciones,
      id_usuario,
      id_asignatura,
      JSON.stringify(calificacionesActualizadas)
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error al agregar la calificación:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar una calificación
export async function PUT(request: Request) {
  try {
    const { id_usuario, id_asignatura, calificacion, prueba } = await request.json();

    if (!id_usuario || !id_asignatura || !calificacion || !prueba) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Obtener las calificaciones actuales del estudiante
    const stmtGet = db.prepare(`
      SELECT calificaciones FROM Calificacion
      WHERE id_usuario = ? AND id_asignatura = ?
    `);
    const calificacionesActuales = stmtGet.get(id_usuario, id_asignatura) as { calificaciones: string } | undefined;

    if (!calificacionesActuales) {
      return NextResponse.json(
        { success: false, error: "No se encontraron calificaciones para el estudiante y asignatura especificados" },
        { status: 404 }
      );
    }

    // Actualizar la calificación específica
    const calificacionesParsed: CalificacionParsed[] = JSON.parse(calificacionesActuales.calificaciones);
    const calificacionIndex = calificacionesParsed.findIndex((cal) => cal.prueba === prueba);

    if (calificacionIndex === -1) {
      return NextResponse.json(
        { success: false, error: "No se encontró la prueba especificada" },
        { status: 404 }
      );
    }

    calificacionesParsed[calificacionIndex].nota = calificacion;

    const stmtUpdate = db.prepare(`
      UPDATE Calificacion
      SET calificaciones = ?
      WHERE id_usuario = ? AND id_asignatura = ?
    `);
    stmtUpdate.run(
      JSON.stringify(calificacionesParsed),
      id_usuario,
      id_asignatura
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la calificación:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una calificación
export async function DELETE(request: Request) {
  try {
    const { id_usuario, id_asignatura, prueba } = await request.json();

    if (!id_usuario || !id_asignatura || !prueba) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Obtener las calificaciones actuales del estudiante
    const stmtGet = db.prepare(`
      SELECT calificaciones FROM Calificacion
      WHERE id_usuario = ? AND id_asignatura = ?
    `);
    const calificacionesActuales = stmtGet.get(id_usuario, id_asignatura) as { calificaciones: string } | undefined;

    if (!calificacionesActuales) {
      return NextResponse.json(
        { success: false, error: "No se encontraron calificaciones para el estudiante y asignatura especificados" },
        { status: 404 }
      );
    }

    // Eliminar la calificación específica
    const calificacionesParsed: CalificacionParsed[] = JSON.parse(calificacionesActuales.calificaciones);
    const calificacionesFiltradas = calificacionesParsed.filter((cal) => cal.prueba !== prueba);

    const stmtUpdate = db.prepare(`
      UPDATE Calificacion
      SET calificaciones = ?
      WHERE id_usuario = ? AND id_asignatura = ?
    `);
    stmtUpdate.run(
      JSON.stringify(calificacionesFiltradas),
      id_usuario,
      id_asignatura
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar la calificación:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}