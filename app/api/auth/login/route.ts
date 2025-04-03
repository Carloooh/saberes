// import { NextResponse } from "next/server";
// import db from "@/db";
// import bcrypt from "bcrypt";

// interface UserData {
//   rut_usuario: string;
//   rut_tipo: string;
//   email: string;
//   clave: string;
//   nombres: string;
//   apellidos: string;
//   tipo_usuario: string;
//   estado: string;
//   edad?: number;
//   sexo?: string;
//   nacionalidad?: string;
//   talla?: string;
//   fecha_nacimiento?: string;
//   direccion?: string;
//   comuna?: string;
//   sector?: string;
//   codigo_temporal?: string;
// }

// interface UserResponse {
//   rut_usuario: string;
//   email: string;
//   nombres: string;
//   apellidos: string;
//   tipo_usuario: string;
//   estado: string;
// }

// export async function POST(req: Request) {
//   try {
//     const { rut_usuario, clave } = await req.json();
//     const stmt = db.prepare(`SELECT * FROM Usuario WHERE rut_usuario = ?`);
//     const user = stmt.get(rut_usuario) as UserData;

//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: "Usuario no encontrado" },
//         { status: 404 }
//       );
//     }

//     if (!user.clave || typeof user.clave !== "string") {
//       return NextResponse.json(
//         { success: false, error: "Error en la autenticación" },
//         { status: 500 }
//       );
//     }

//     const isPasswordValid = await bcrypt.compare(clave, user.clave);
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { success: false, error: "Credenciales incorrectas" },
//         { status: 401 }
//       );
//     }

//     if (user.estado === "Matricula") {
//       return NextResponse.json(
//         { success: false, error: "Matricula aún no aprobada" },
//         { status: 401 }
//       );
//     } else if (user.estado === "Inactiva") {
//       return NextResponse.json(
//         { success: false, error: "Cuenta inactiva" },
//         { status: 401 }
//       );
//     } else if (user.estado === "Pendiente") {
//       return NextResponse.json(
//         { success: false, error: "Cuenta pendiente de aprobación" },
//         { status: 401 }
//       );
//     }

//     // delete user.clave;
//     // delete user.edad;
//     // delete user.sexo;
//     // delete user.nacionalidad;
//     // delete user.talla;
//     // delete user.fecha_nacimiento;
//     // delete user.direccion;
//     // delete user.comuna;
//     // delete user.sector;
//     // delete user.codigo_temporal;
//     // delete user.rut_tipo;

//     const userResponse: UserResponse = {
//       rut_usuario: user.rut_usuario,
//       email: user.email,
//       nombres: user.nombres,
//       apellidos: user.apellidos,
//       tipo_usuario: user.tipo_usuario,
//       estado: user.estado,
//     };

//     const response = NextResponse.json(
//       // { success: true, user },
//       { success: true, user: userResponse },
//       { status: 200 }
//     );

//     response.cookies.set({
//       name: "userSession",
//       value: JSON.stringify({
//         rut_usuario: user.rut_usuario,
//         tipo_usuario: user.tipo_usuario,
//       }),
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       path: "/",
//       maxAge: 60 * 60 * 24,
//     });

//     return response;
//   } catch (error) {
//     console.error("Error en el login:", error);
//     return NextResponse.json(
//       { success: false, error: "Error en el servidor" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import bcrypt from "bcrypt";

interface UserData {
  id_user: string;
  rut_usuario: string;
  rut_tipo: string;
  email: string;
  clave: string;
  nombres: string;
  apellidos: string;
  tipo_usuario: string;
  estado: string;
  edad?: number;
  sexo?: string;
  nacionalidad?: string;
  talla?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  comuna?: string;
  sector?: string;
  codigo_temporal?: string;
}

interface UserResponse {
  id_user: string;
  rut_usuario: string;
  email: string;
  nombres: string;
  apellidos: string;
  tipo_usuario: string;
  estado: string;
}

// Helper function to execute SQL queries
function executeSQL(
  connection: Connection,
  sql: string,
  parameters: { name: string; type: any; value: any }[] = []
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const request = new Request(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });

    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });

    request.on("row", (columns: any[]) => {
      const row: any = {};
      columns.forEach((column) => {
        row[column.metadata.colName] = column.value;
      });
      results.push(row);
    });

    connection.execSql(request);
  });
}

export async function POST(req: NextRequest) {
  try {
    const { rut_usuario, clave } = await req.json();

    // Create and connect to the database
    const connection = new Connection(config);
    await new Promise<void>((resolve, reject) => {
      connection.on("connect", (err) => {
        if (err) {
          console.error("Error al conectar a la BD:", err.message);
          return reject(err);
        }
        resolve();
      });
      connection.connect();
    });

    // Query the user
    const users = await executeSQL(
      connection,
      "SELECT * FROM Usuario WHERE rut_usuario = @rut",
      [{ name: "rut", type: TYPES.NVarChar, value: rut_usuario }]
    );

    connection.close();

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const user = users[0] as UserData;

    if (!user.clave || typeof user.clave !== "string") {
      return NextResponse.json(
        { success: false, error: "Error en la autenticación" },
        { status: 500 }
      );
    }

    const isPasswordValid = await bcrypt.compare(clave, user.clave);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    if (user.estado === "Matricula") {
      return NextResponse.json(
        { success: false, error: "Matricula aún no aprobada" },
        { status: 401 }
      );
    } else if (user.estado === "Inactiva") {
      return NextResponse.json(
        { success: false, error: "Cuenta inactiva" },
        { status: 401 }
      );
    } else if (user.estado === "Pendiente") {
      return NextResponse.json(
        { success: false, error: "Cuenta pendiente de aprobación" },
        { status: 401 }
      );
    }

    const userResponse: UserResponse = {
      id_user: user.id_user,
      rut_usuario: user.rut_usuario,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      tipo_usuario: user.tipo_usuario,
      estado: user.estado,
    };

    const response = NextResponse.json(
      { success: true, user: userResponse },
      { status: 200 }
    );

    response.cookies.set({
      name: "userSession",
      value: JSON.stringify({
        id_user: user.id_user,
        rut_usuario: user.rut_usuario,
        tipo_usuario: user.tipo_usuario,
      }),
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error en el login:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
