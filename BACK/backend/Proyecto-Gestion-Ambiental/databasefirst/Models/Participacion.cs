using System;
using System.Collections.Generic;

namespace databasefirst.Models;

public partial class Participacion
{
    public int id_participacion { get; set; }

    public int? id_user { get; set; }

    public int? id_actividad { get; set; }

    public DateTime? fecha_inscripcion { get; set; }

    public string? rol_en_actividad { get; set; }

    public string? observaciones { get; set; }

    public string? estado { get; set; }

    public virtual Actividad? id_actividadNavigation { get; set; }

    public virtual Usuario? id_userNavigation { get; set; }
}
