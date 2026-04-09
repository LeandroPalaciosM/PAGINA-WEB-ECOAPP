-- 1. Crear la base de datos 
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'Ambiental')
BEGIN
    CREATE DATABASE Ambiental;
END
GO

USE Ambiental;
GO

-- 2. Tabla: Usuario 
CREATE TABLE Usuario (
    id_user INT IDENTITY(1,1) PRIMARY KEY, 
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Activo'
);
GO

-- 3. Tabla: Categoria 
CREATE TABLE Categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(MAX), 
    estado VARCHAR(50) DEFAULT 'Activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);
GO

-- 4. Tabla: Iniciativa 
CREATE TABLE Iniciativa (
    id_iniciativa INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(MAX),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50),
    id_categoria INT,
    CONSTRAINT FK_Iniciativa_Categoria FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);
GO

-- 5. Tabla: Actividad 
CREATE TABLE Actividad (
    id_actividad INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(MAX),
    fecha DATETIME,
    lugar VARCHAR(200),
    cupo_maximo INT,
    estado VARCHAR(50),
    id_iniciativa INT,
    CONSTRAINT FK_Actividad_Iniciativa FOREIGN KEY (id_iniciativa) REFERENCES Iniciativa(id_iniciativa)
);
GO

-- 6. Tabla: Participacion 
CREATE TABLE Participacion (
    id_participacion INT IDENTITY(1,1) PRIMARY KEY,
    id_user INT,
    id_actividad INT,
    fecha_inscripcion DATETIME DEFAULT GETDATE(),
    rol_en_actividad VARCHAR(50),
    observaciones VARCHAR(MAX),
    estado VARCHAR(50),
    CONSTRAINT FK_Participacion_Usuario FOREIGN KEY (id_user) REFERENCES Usuario(id_user),
    CONSTRAINT FK_Participacion_Actividad FOREIGN KEY (id_actividad) REFERENCES Actividad(id_actividad)
);
GO

-- 7. Tabla: Reporte 
CREATE TABLE Reporte (
    id_reporte INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(MAX),
    fecha DATETIME DEFAULT GETDATE(),
    observaciones VARCHAR(MAX),
    aprobado BIT DEFAULT 0, 
    id_actividad INT,
    CONSTRAINT FK_Reporte_Actividad FOREIGN KEY (id_actividad) REFERENCES Actividad(id_actividad)
);
GO

ALTER TABLE Reporte 
ADD id_user INT NOT NULL,
    id_iniciativa INT NULL; 


ALTER TABLE Reporte
ADD CONSTRAINT FK_Reporte_Usuario 
FOREIGN KEY (id_user) REFERENCES Usuario(id_user);

ALTER TABLE Reporte
ADD CONSTRAINT FK_Reporte_Iniciativa 
FOREIGN KEY (id_iniciativa) REFERENCES Iniciativa(id_iniciativa);
GO

USE Ambiental;
GO

-- 1. Inserciones para la tabla: Usuario
INSERT INTO Usuario (nombre, apellido, correo, contrasena, rol, estado) VALUES
('Ana', 'García', 'ana.garcia@email.com', 'pass123', 'Voluntario', 'Activo'),          -- id_user: 1
('Carlos', 'López', 'carlos.lopez@email.com', 'securePass', 'Administrador', 'Activo'),  -- id_user: 2
('Beatriz', 'Méndez', 'bea.mendez@email.com', 'bea2024', 'Voluntario', 'Activo'),        -- id_user: 3
('David', 'Ruiz', 'david.ruiz@email.com', 'davr_99', 'Coordinador', 'Activo'),           -- id_user: 4
('Elena', 'Torres', 'elena.torres@email.com', 'elenaT_pass', 'Voluntario', 'Inactivo');  -- id_user: 5
GO

-- 2. Inserciones para la tabla: Categoria
INSERT INTO Categoria (nombre, descripcion, estado) VALUES
('Reforestación', 'Proyectos de siembra de árboles en zonas urbanas y rurales', 'Activo'),
('Gestión de Residuos', 'Reciclaje y limpieza de espacios públicos', 'Activo'),
('Conservación de Agua', 'Iniciativas para el cuidado de cuencas y ríos', 'Activo'),
('Energía Renovable', 'Promoción de energías limpias y solares', 'Activo'),
('Educación Ambiental', 'Talleres y charlas para concientizar a la comunidad', 'Activo');
GO

-- 3. Inserciones para la tabla: Iniciativa
INSERT INTO Iniciativa (nombre, descripcion, fecha_inicio, fecha_fin, estado, id_categoria) VALUES
('Verde Ciudad', 'Campaña para aumentar áreas verdes en el centro', '2024-01-10', '2024-12-20', 'En Progreso', 1), -- id_iniciativa: 1
('Playa Limpia', 'Jornadas mensuales de limpieza de playas', '2024-02-01', '2024-11-30', 'Planificada', 2),   -- id_iniciativa: 2
('Gota a Gota', 'Campaña de ahorro de agua en escuelas', '2024-03-15', '2024-09-15', 'Finalizada', 3),        -- id_iniciativa: 3
('Sol para Todos', 'Instalación de paneles en centros comunitarios', '2024-04-01', '2025-04-01', 'En Progreso', 4), -- id_iniciativa: 4
('Escuela Eco', 'Ciclo de charlas en colegios secundarios', '2024-03-01', '2024-12-15', 'Activo', 5);         -- id_iniciativa: 5
GO

-- 4. Inserciones para la tabla: Actividad
INSERT INTO Actividad (nombre, descripcion, fecha, lugar, cupo_maximo, estado, id_iniciativa) VALUES
('Siembra Parque Central', 'Plantación de 50 árboles nativos', '2024-06-05 09:00:00', 'Parque Central', 30, 'Abierta', 1),   -- id_actividad: 1
('Recogida Plásticos Norte', 'Limpieza del sector norte de la playa', '2024-07-15 08:30:00', 'Playa Norte', 50, 'Abierta', 2), -- id_actividad: 2
('Taller Ahorro Agua', 'Taller práctico para niños sobre el agua', '2024-08-10 10:00:00', 'Escuela #5', 25, 'Cerrada', 3),     -- id_actividad: 3
('Instalación Panel Sede', 'Montaje del sistema solar en la sede vecinal', '2024-09-20 09:00:00', 'Sede Vecinal Los Pinos', 10, 'Planificada', 4), -- id_actividad: 4
('Charla Reciclaje', 'Charla sobre separación de residuos', '2024-05-12 11:00:00', 'Colegio San Mateo', 100, 'Realizada', 5); -- id_actividad: 5
GO

-- 5. Inserciones para la tabla: Participacion
INSERT INTO Participacion (id_user, id_actividad, rol_en_actividad, observaciones, estado) VALUES
(1, 1, 'Participante', 'Trajo sus propias herramientas', 'Confirmado'),
(3, 1, 'Participante', 'Primera vez participando', 'Confirmado'),
(2, 2, 'Coordinador', 'Encargado de logística', 'Confirmado'),
(4, 3, 'Expositor', 'Experto en temas hídricos', 'Confirmado'),
(1, 5, 'Oyente', 'Asistió a la charla completa', 'Asistió');
GO

-- 6. Inserciones para la tabla: Reporte 
INSERT INTO Reporte (descripcion, observaciones, aprobado, id_actividad, id_user, id_iniciativa) VALUES
('Informe de siembra exitosa', 'Se plantaron 48 de los 50 árboles previstos.', 1, 1, 4, 1),        -- Reporta David (Coord), Iniciativa 1
('Reporte de residuos recolectados', 'Se juntaron 200kg de plástico.', 1, 2, 2, 2),                -- Reporta Carlos (Admin), Iniciativa 2
('Evaluación del taller escolar', 'Los niños participaron activamente, faltaron materiales.', 0, 3, 4, 3), -- Reporta David, Iniciativa 3
('Informe preliminar de instalación', 'Se requiere comprar más cableado.', 0, 4, 2, 4),            -- Reporta Carlos, Iniciativa 4
('Registro de asistencia charla', 'Asistencia del 90% del alumnado esperado.', 1, 5, 4, 5);        -- Reporta David, Iniciativa 5
GO