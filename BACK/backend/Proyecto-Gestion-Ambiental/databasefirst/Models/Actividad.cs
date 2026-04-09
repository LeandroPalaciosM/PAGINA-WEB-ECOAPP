using System;
using System.Collections.Generic;

namespace databasefirst.Models;

public partial class Actividad
{
    public int id_actividad { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public DateTime? fecha { get; set; }

    public string? lugar { get; set; }

    public int? cupo_maximo { get; set; }

    public string? estado { get; set; }

    public int? id_iniciativa { get; set; }

    public virtual ICollection<Participacion> Participacions { get; set; } = new List<Participacion>();

    public virtual ICollection<Reporte> Reportes { get; set; } = new List<Reporte>();

    public virtual Iniciativa? id_iniciativaNavigation { get; set; }
}
