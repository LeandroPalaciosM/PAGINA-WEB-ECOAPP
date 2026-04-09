using databasefirst.Contexts;
using databasefirst.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

//Gabriela Gonzalez - 20/01/2026 - Se agregó el controlador de Participacion
//con sus respectivos endpoints para gestionar las inscripciones a actividades,
//incluyendo la lógica de autorización para que los voluntarios solo puedan ver y cancelar sus propias inscripciones,
//mientras que los administradores y coordinadores puedan gestionar todas las inscripciones.
namespace ApiAmbiental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ParticipacionsController : ControllerBase
    {
        private readonly AmbientalContext _context;

        public ParticipacionsController(AmbientalContext context)
        {
            _context = context;
        }

        // GET: api/Participacions
        [HttpGet]
       [Authorize(Roles = "Administrador, Coordinador")]
        public async Task<ActionResult<IEnumerable<Participacion>>> GetParticipacions()
        {
            return await _context.Participacions
                .Include(p => p.id_userNavigation)
                .Include(p => p.id_actividadNavigation)
                .ToListAsync();
        }

        // GET: api/Participacions/por-actividad/5
        [HttpGet("por-actividad/{idActividad}")]
        [Authorize(Roles = "Administrador, Coordinador")]
        public async Task<ActionResult<IEnumerable<Participacion>>> GetPorActividad(int idActividad)
        {
            var lista = await _context.Participacions
                .Include(p => p.id_userNavigation)
                .Where(p => p.id_actividad == idActividad)
                .ToListAsync();

            return lista;
        }

        [HttpGet("mis-inscripciones")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Participacion>>> GetMisInscripciones()
        {
            var userIdClaim = User.FindFirst("id")?.Value ??
                              User.FindFirst("id_user")?.Value ??
                              User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                              User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "No se encontró el ID del usuario en el token." });
            }

            int userId = int.Parse(userIdClaim);

            var misParticipaciones = await _context.Participacions
                .Include(p => p.id_actividadNavigation)
                .Where(p => p.id_user == userId)
                .ToListAsync();

            return misParticipaciones;
        }

        // GET: api/Participacions/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Participacion>> GetParticipacion(int id)
        {
            var participacion = await _context.Participacions
                .Include(p => p.id_userNavigation)
                .Include(p => p.id_actividadNavigation)
                .FirstOrDefaultAsync(p => p.id_participacion == id);

            if (participacion == null) return NotFound();

            if (User.IsInRole("Voluntario"))
            {
                var userIdClaim = User.FindFirst("id")?.Value ??
                                  User.FindFirst("id_user")?.Value ??
                                  User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

                var userId = int.Parse(userIdClaim);

                if (participacion.id_user != userId) return Forbid();
            }

            return participacion;
        }

        // POST: api/Participacions
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Participacion>> PostParticipacion(Participacion participacion)
        {
            if (participacion.fecha_inscripcion == default) participacion.fecha_inscripcion = DateTime.Now;
            if (string.IsNullOrEmpty(participacion.estado)) participacion.estado = "Pendiente";

            _context.Participacions.Add(participacion);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return BadRequest(new { message = "Error al inscribirse. Verifica que no estés ya inscrito." });
            }

            return CreatedAtAction("GetParticipacion", new { id = participacion.id_participacion }, participacion);
        }

        // PUT: api/Participacions/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador, Coordinador")]
        public async Task<IActionResult> PutParticipacion(int id, Participacion participacion)
        {
            if (id != participacion.id_participacion) return BadRequest();

            _context.Entry(participacion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ParticipacionExists(id)) return NotFound();
                else throw;
            }

            return Ok(new { message = "Estado actualizado correctamente" });
        }

        // DELETE: api/Participacions/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteParticipacion(int id)
        {
            var participacion = await _context.Participacions.FindAsync(id);
            if (participacion == null) return NotFound();

            if (User.IsInRole("Voluntario"))
            {
                var userIdClaim = User.FindFirst("id")?.Value ??
                                  User.FindFirst("id_user")?.Value ??
                                  User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { message = "No se pudo identificar al usuario." });
                }

                var userId = int.Parse(userIdClaim);

                if (participacion.id_user != userId)
                {
                    return StatusCode(403, new { message = "No puedes cancelar inscripciones de otros." });
                }
            }

            participacion.estado = "Cancelado";
            _context.Entry(participacion).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Inscripción cancelada." });
        }

        private bool ParticipacionExists(int id)
        {
            return _context.Participacions.Any(e => e.id_participacion == id);
        }
    }
}