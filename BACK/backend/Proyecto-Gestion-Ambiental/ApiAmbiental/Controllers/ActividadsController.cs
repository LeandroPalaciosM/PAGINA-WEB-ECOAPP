using databasefirst.Contexts;
using databasefirst.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
//Lilibeth Torres - 20/01/2026 - Se agregó el controlador de Actividades
//con sus respectivos endpoints para gestionar las actividades de las iniciativas,
//incluyendo la lógica de autorización para que los voluntarios solo puedan ver las actividades activas o pendientes,
//mientras que los administradores y coordinadores puedan gestionar todas las actividades.
namespace Api_Actividades.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActividadsController : ControllerBase
    {
        private readonly AmbientalContext _context;

        public ActividadsController(AmbientalContext context)
        {
            _context = context;
        }

        // GET: api/Actividads
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Actividad>>> GetActividads()
        {
            return await _context.Actividads.ToListAsync();
        }

        // GET: api/Actividads/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador, Coordinador, Voluntario")]
        public async Task<ActionResult<Actividad>> GetActividad(int id)
        {
            var actividad = await _context.Actividads.FindAsync(id);

            if (actividad == null)
            {
                return NotFound();
            }

            return actividad;
        }

        // GET: api/Actividads/detalles/5
        [HttpGet("detalles/{id}")]
        [Authorize(Roles = "Administrador, Coordinador, Voluntario")]
        public async Task<ActionResult<Actividad>> GetActividadConIniciativa(int id)
        {
            var actividad = await _context.Actividads
                .Include(a => a.id_iniciativaNavigation)
                .FirstOrDefaultAsync(a => a.id_actividad == id);

            if (actividad == null) return NotFound();
            return actividad;
        }

        // GET: api/Actividads/buscar
        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<Actividad>>> BuscarActividad([FromQuery] string nombre)
        {
            return await _context.Actividads
                .Include(a => a.id_iniciativaNavigation)
                .Where(a => a.nombre.Contains(nombre))
                .ToListAsync();
        }

        // GET: api/Actividads/buscarPorLugar
        [HttpGet("buscarPorLugar")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Actividad>>> BuscarPorLugar([FromQuery] string lugar)
        {
            var query = _context.Actividads
                .Include(a => a.id_iniciativaNavigation)
                .AsQueryable();

            if (!string.IsNullOrEmpty(lugar))
            {
                query = query.Where(a => a.lugar.Contains(lugar));
            }

            query = query.Where(a => a.estado != "Cancelado");

            var resultados = await query.ToListAsync();

            if (!resultados.Any())
            {
                return NotFound("No se encontraron actividades en el lugar especificado.");
            }

            return Ok(resultados);
        }


        // GET: api/Actividads/activas
        [HttpGet("activas")]
        [Authorize(Roles = "Administrador, Coordinador, Voluntario")]
        public async Task<ActionResult<IEnumerable<Actividad>>> GetActividadsActivas()
        {
            return await _context.Actividads
                .Include(a => a.id_iniciativaNavigation)
                .Where(a => a.estado == "Pendiente")
                .ToListAsync();
        }



        // PUT: api/Actividads/5

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador, Coordinador")]
        public async Task<IActionResult> PutActividad(int id, Actividad actividad)
        {
            if (id != actividad.id_actividad)
            {
                return BadRequest();
            }

            _context.Entry(actividad).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActividadExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Actividads
        [HttpPost]
        [Authorize(Roles = "Administrador, Coordinador")]
        public async Task<ActionResult<Actividad>> PostActividad(Actividad actividad)
        {
            _context.Actividads.Add(actividad);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetActividad", new { id = actividad.id_actividad }, actividad);
        }

        // DELETE: api/Actividads/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> DeleteActividad(int id)
        {
            var actividad = await _context.Actividads.FindAsync(id);
            if (actividad == null)
            {
                return NotFound();
            }

            _context.Actividads.Remove(actividad);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("InscripcionesVoluntarios")]
        [Authorize(Roles = "Voluntario")]
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

        [HttpPost("{id}/Inscribirse")]
        [Authorize(Roles = "Voluntario")] 
        public async Task<IActionResult> Inscribirse(int id)
        {
            
            var userIdClaim = User.FindFirst("id")?.Value ??
                              User.FindFirst("id_user")?.Value ??
                              User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "Token inválido: No se encontró el ID del usuario." });
            }

            int userId;
            if (!int.TryParse(userIdClaim, out userId))
            {
                return BadRequest(new { message = "El ID del usuario en el token no es válido." });
            }

            var actividad = await _context.Actividads.FindAsync(id);
            if (actividad == null)
            {
                return NotFound(new { message = "La actividad no existe." });
            }

            var yaInscrito = await _context.Participacions
                .AnyAsync(p => p.id_user == userId && p.id_actividad == id);

            if (yaInscrito)
            {
                return BadRequest(new { message = "Ya estás inscrito en esta actividad." });
            }

            var nuevaParticipacion = new Participacion
            {
                id_user = userId,
                id_actividad = id,
                fecha_inscripcion = DateTime.Now,
                estado = "Pendiente" 
            };

            _context.Participacions.Add(nuevaParticipacion);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al guardar la inscripción: " + ex.Message });
            }

            return Ok(new { message = "Inscripción exitosa" });
        }

        private bool ActividadExists(int id)
        {
            return _context.Actividads.Any(e => e.id_actividad == id);
        }
    }
}