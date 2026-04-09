using System;
using System.Collections.Generic;

namespace databasefirst.Models;

public partial class Categorium
{
    public int id_categoria { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public string? estado { get; set; }

    public DateTime? fecha_creacion { get; set; }

    public virtual ICollection<Iniciativa> Iniciativas { get; set; } = new List<Iniciativa>();
}
