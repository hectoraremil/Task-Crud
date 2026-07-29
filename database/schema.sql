IF DB_ID('task_crud_db') IS NULL
BEGIN
    CREATE DATABASE task_crud_db;
END;
GO

USE task_crud_db;
GO

IF OBJECT_ID('dbo.tareas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tareas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        titulo NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(255) NULL,
        estado NVARCHAR(20) NOT NULL DEFAULT 'Pendiente',
        fecha_limite DATE NULL,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
    );
END;
GO
