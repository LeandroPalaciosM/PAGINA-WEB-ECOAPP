using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using databasefirst.Models;

namespace databasefirst.Contexts;

public partial class AmbientalContext : DbContext
{
    public AmbientalContext()
    {
    }

    public AmbientalContext(DbContextOptions<AmbientalContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Actividad> Actividads { get; set; }

    public virtual DbSet<Categorium> Categoria { get; set; }

    public virtual DbSet<Iniciativa> Iniciativas { get; set; }

    public virtual DbSet<Participacion> Participacions { get; set; }

    public virtual DbSet<Reporte> Reportes { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-M9B9Q8D;Database=Ambiental;User ID=sa;Password=1234;TrustServerCertificate=True;MultipleActiveResultSets=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Actividad>(entity =>
        {
            entity.HasKey(e => e.id_actividad).HasName("PK__Activida__DCD348832A885D06");

            entity.ToTable("Actividad");

            entity.Property(e => e.descripcion).IsUnicode(false);
            entity.Property(e => e.estado)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.fecha).HasColumnType("datetime");
            entity.Property(e => e.lugar)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.nombre)
                .HasMaxLength(150)
                .IsUnicode(false);

            entity.HasOne(d => d.id_iniciativaNavigation).WithMany(p => p.Actividads)
                .HasForeignKey(d => d.id_iniciativa)
                .HasConstraintName("FK_Actividad_Iniciativa");
        });

        modelBuilder.Entity<Categorium>(entity =>
        {
            entity.HasKey(e => e.id_categoria).HasName("PK__Categori__CD54BC5A81F0F8A1");

            entity.Property(e => e.descripcion).IsUnicode(false);
            entity.Property(e => e.estado)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("Activo");
            entity.Property(e => e.fecha_creacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Iniciativa>(entity =>
        {
            entity.HasKey(e => e.id_iniciativa).HasName("PK__Iniciati__4A708E3D9FD3D611");

            entity.ToTable("Iniciativa");

            entity.Property(e => e.descripcion).IsUnicode(false);
            entity.Property(e => e.estado)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.nombre)
                .HasMaxLength(150)
                .IsUnicode(false);

            entity.HasOne(d => d.id_categoriaNavigation).WithMany(p => p.Iniciativas)
                .HasForeignKey(d => d.id_categoria)
                .HasConstraintName("FK_Iniciativa_Categoria");
        });

        modelBuilder.Entity<Participacion>(entity =>
        {
            entity.HasKey(e => e.id_participacion).HasName("PK__Particip__E42D0FE0B507B4A3");

            entity.ToTable("Participacion");

            entity.Property(e => e.estado)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.fecha_inscripcion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.observaciones).IsUnicode(false);
            entity.Property(e => e.rol_en_actividad)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.id_actividadNavigation).WithMany(p => p.Participacions)
                .HasForeignKey(d => d.id_actividad)
                .HasConstraintName("FK_Participacion_Actividad");

            entity.HasOne(d => d.id_userNavigation).WithMany(p => p.Participacions)
                .HasForeignKey(d => d.id_user)
                .HasConstraintName("FK_Participacion_Usuario");
        });

        modelBuilder.Entity<Reporte>(entity =>
        {
            entity.HasKey(e => e.id_reporte).HasName("PK__Reporte__87E4F5CBA4EB5FA0");

            entity.ToTable("Reporte");

            entity.Property(e => e.aprobado).HasDefaultValue(false);
            entity.Property(e => e.descripcion).IsUnicode(false);
            entity.Property(e => e.fecha)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.observaciones).IsUnicode(false);

            entity.HasOne(d => d.id_actividadNavigation).WithMany(p => p.Reportes)
                .HasForeignKey(d => d.id_actividad)
                .HasConstraintName("FK_Reporte_Actividad");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.id_user).HasName("PK__Usuario__D2D146370DEE7960");

            entity.ToTable("Usuario");

            entity.HasIndex(e => e.correo, "UQ__Usuario__2A586E0B9048A4A8").IsUnique();

            entity.Property(e => e.apellido)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.contrasena)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.correo)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.estado)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("Activo");
            entity.Property(e => e.nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.rol)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
