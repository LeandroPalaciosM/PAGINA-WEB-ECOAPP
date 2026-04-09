using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace databasefirst.Models;

public partial class Reporte
{
    public int id_reporte { get; set; }
    public string? descripcion { get; set; }
    public DateTime? fecha { get; set; }
    public string? observaciones { get; set; }
    public bool? aprobado { get; set; }

    public int? id_actividad { get; set; }
    public int id_user { get; set; }     
    public int? id_iniciativa { get; set; } 


    [ForeignKey("id_actividad")]
    public virtual Actividad? id_actividadNavigation { get; set; }

    [ForeignKey("id_user")]
    public virtual Usuario? id_userNavigation { get; set; }

    [ForeignKey("id_iniciativa")]
    public virtual Iniciativa? id_iniciativaNavigation { get; set; }
}