using databasefirst.Models;
using databasefirst.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
//Eduardo Chavez - 20/01/2026 - Se agregó el controlador de Reportes
//con sus respectivos endpoints para gestionar los reportes de actividades e iniciativas,
//incluyendo la lógica de autorización para que los coordinadores solo puedan gestionar sus propios reportes,
//mientras que los administradores puedan gestionar todos los reportes.
namespace ApiAmbiental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class ReportesController : ControllerBase
    {
        private readonly AmbientalContext _context;

        public ReportesController(AmbientalContext context)
        {
            _context = context;
        }

        // GET: api/Reportes
        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<IEnumerable<Reporte>>> GetReportes()
        {
            return await _context.Reportes
                .Include(p => p.id_actividadNavigation)
                .Include(p => p.id_iniciativaNavigation)
                .ToListAsync();
        }

        // GET: api/Reportes/mis-reportes
        [HttpGet("mis-reportes")]
        [Authorize(Roles = "Coordinador,Administrador")] 
        public async Task<ActionResult<IEnumerable<Reporte>>> GetMisReportes()
        {
            var userIdClaim = User.FindFirst("id")?.Value
                           ?? User.FindFirst("id_user")?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "Token inválido: Sin ID de usuario." });
            }

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return BadRequest(new { message = "El ID del usuario en el token no es un número válido." });
            }

            var reportes = await _context.Reportes
                .Include(p => p.id_actividadNavigation)
                .Include(p => p.id_iniciativaNavigation)
                .Where(r => r.id_user == userId)
                .ToListAsync();

            return Ok(reportes);
        }

        // GET: api/Reportes/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Coordinador")]
        public async Task<ActionResult<Reporte>> GetReporte(int id)
        {
            var reporte = await _context.Reportes
                .Include(p => p.id_actividadNavigation)
                .Include(p => p.id_iniciativaNavigation)
                .FirstOrDefaultAsync(r => r.id_reporte == id);

            if (reporte == null) return NotFound();

            return reporte;
        }

        // PUT: api/Reportes/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador,Coordinador")]
        public async Task<IActionResult> PutReporte(int id, Reporte reporteEntrante)
        {
            if (id != reporteEntrante.id_reporte) return BadRequest(new { message = "El ID no coincide" });

            var reporteExistente = await _context.Reportes.FindAsync(id);
            if (reporteExistente == null) return NotFound(new { message = "Reporte no encontrado" });

            var esAdmin = User.IsInRole("Administrador");

            if (!esAdmin)
            {
                reporteEntrante.aprobado = reporteExistente.aprobado;
            }
            else
            {
                reporteExistente.aprobado = reporteEntrante.aprobado;
            }

            reporteExistente.descripcion = reporteEntrante.descripcion;
            reporteExistente.fecha = reporteEntrante.fecha;
            reporteExistente.observaciones = reporteEntrante.observaciones;

            if (reporteEntrante.id_actividad != null && reporteEntrante.id_actividad > 0)
            {
                reporteExistente.id_actividad = reporteEntrante.id_actividad;
                var actividad = await _context.Actividads.FindAsync(reporteEntrante.id_actividad);
                if (actividad != null) reporteExistente.id_iniciativa = actividad.id_iniciativa;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReporteExists(id)) return NotFound();
                else throw;
            }

            return Ok(new { message = "Reporte actualizado correctamente." });
        }

        // POST: api/Reportes
        [HttpPost]
        [Authorize(Roles = "Administrador,Coordinador")]
        public async Task<ActionResult<Reporte>> PostReporte(Reporte reporte)
        {
            var userIdClaim = User.FindFirst("id")?.Value
                           ?? User.FindFirst("id_user")?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "No se pudo identificar al usuario." });

            reporte.id_user = int.Parse(userIdClaim);

            // Al crear, forzamos que no esté aprobado (a menos que seas admin, pero por defecto false es seguro)
            if (!User.IsInRole("Administrador"))
            {
                reporte.aprobado = false;
            }

            if (reporte.fecha == null) reporte.fecha = DateTime.Now;

            if (reporte.id_actividad != null && reporte.id_actividad > 0)
            {
                var actividad = await _context.Actividads.FindAsync(reporte.id_actividad);
                if (actividad != null)
                {
                    reporte.id_iniciativa = actividad.id_iniciativa;
                }
            }

            _context.Reportes.Add(reporte);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReporte", new { id = reporte.id_reporte }, reporte);
        }

        // DELETE: api/Reportes/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador,Coordinador")]
        public async Task<IActionResult> DeleteReporte(int id)
        {
            var reporte = await _context.Reportes.FindAsync(id);
            if (reporte == null) return NotFound();

            if (User.IsInRole("Coordinador"))
            {
                var userIdClaim = User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim != null && reporte.id_user != int.Parse(userIdClaim))
                {
                    return StatusCode(403, new { message = "No puedes eliminar reportes que no son tuyos." });
                }
            }

            _context.Reportes.Remove(reporte);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/Reportes/buscar/
        [HttpGet("buscar/descripcion/{termino}")]
        [Authorize(Roles = "Administrador,Coordinador")]
        public async Task<ActionResult<IEnumerable<Reporte>>> GetPorDescripcion(string termino)
        {
            return await _context.Reportes
                .Include(p => p.id_actividadNavigation)
                .Include(p => p.id_iniciativaNavigation)
                .Where(r => r.descripcion.Contains(termino) ||
                            (r.id_actividadNavigation != null && r.id_actividadNavigation.nombre.Contains(termino)))
                .ToListAsync();
        }

        [HttpGet("filtrar/fechas")]
        [Authorize(Roles = "Administrador,Coordinador")]
        public async Task<ActionResult<IEnumerable<Reporte>>> GetPorFechas([FromQuery] DateTime inicio, [FromQuery] DateTime fin)
        {
            return await _context.Reportes
                .Include(p => p.id_actividadNavigation)
                .Include(p => p.id_iniciativaNavigation)
                .Where(r => r.fecha >= inicio && r.fecha <= fin)
                .ToListAsync();
        }

        // GET: api/Reportes/pendientes
        [HttpGet("pendientes")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<IEnumerable<Reporte>>> GetReportesPendientes()
        {
            return await _context.Reportes
                .Include(p => p.id_actividadNavigation)
                .Include(p => p.id_iniciativaNavigation)
                .Where(r => r.aprobado == false)
                .ToListAsync();
        }

        private bool ReporteExists(int id)
        {
            return _context.Reportes.Any(e => e.id_reporte == id);
        }
    }
}