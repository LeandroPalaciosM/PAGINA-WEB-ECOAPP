using System;
using System.Collections.Generic;

namespace databasefirst.Models;

public partial class Iniciativa
{
    public int id_iniciativa { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public DateOnly? fecha_inicio { get; set; }

    public DateOnly? fecha_fin { get; set; }

    public string? estado { get; set; }

    public int? id_categoria { get; set; }

    public virtual ICollection<Actividad> Actividads { get; set; } = new List<Actividad>();

    public virtual Categorium? id_categoriaNavigation { get; set; }
}
