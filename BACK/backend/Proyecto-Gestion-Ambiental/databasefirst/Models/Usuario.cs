using System;
using System.Collections.Generic;

namespace databasefirst.Models;

public partial class Usuario
{
    public int id_user { get; set; }

    public string nombre { get; set; } = null!;

    public string apellido { get; set; } = null!;

    public string correo { get; set; } = null!;

    public string contrasena { get; set; } = null!;

    public string rol { get; set; } = null!;

    public string? estado { get; set; }

    public virtual ICollection<Participacion> Participacions { get; set; } = new List<Participacion>();
}
