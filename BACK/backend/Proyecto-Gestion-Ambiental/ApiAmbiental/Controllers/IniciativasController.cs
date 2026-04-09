using databasefirst.Contexts;
using databasefirst.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
//Sebastian Mendoza - 20/01/2026 - Se agregó el controlador de Iniciativas
//con sus respectivos endpoints para gestionar las iniciativas ambientales,
//incluyendo la lógica de autorización para que los voluntarios solo puedan ver las iniciativas activas o en progreso,
//mientras que los administradores y coordinadores puedan gestionar todas las iniciativas.
namespace ApiAmbiental.Controllers
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    [ApiController]
    public class IniciativasController : ControllerBase
    {
        private readonly AmbientalContext _context;

        public IniciativasController(AmbientalContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Iniciativa>>> GetIniciativas()
        {
            return await _context.Iniciativas
                .Include(i => i.id_categoriaNavigation) 
                .OrderByDescending(i => i.fecha_inicio)
                .ToListAsync();
        }


        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Iniciativa>> GetIniciativa(int id)
        {
            var iniciativa = await _context.Iniciativas
                .Include(i => i.id_categoriaNavigation) 
                .FirstOrDefaultAsync(i => i.id_iniciativa == id);

            if (iniciativa == null) return NotFound();

            return iniciativa;
        }

        [HttpGet("voluntario")]
        [Authorize(Roles = "Voluntario")]

        public async Task<IActionResult> GetIniciativasVoluntario()
        {
            var iniciativas = await _context.Iniciativas
                .Include(i => i.id_categoriaNavigation)
                .Where(i => i.estado == "Activo" || i.estado == "En Progreso")
                .ToListAsync();

            return Ok(iniciativas);
        }

     
        [HttpPost]
        [Authorize(Roles = "Administrador, Coordinador")]
        public async Task<IActionResult> CrearIniciativa(Iniciativa iniciativa)
        {
            if (string.IsNullOrEmpty(iniciativa.estado)) iniciativa.estado = "Planificada";

            _context.Iniciativas.Add(iniciativa);
            await _context.SaveChangesAsync();

           
            await _context.Entry(iniciativa)
                .Reference(i => i.id_categoriaNavigation)
                .LoadAsync();

            return Ok(iniciativa);
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador, Coordinador")]
        public async Task<IActionResult> ActualizarIniciativa(int id, Iniciativa iniciativaEntrante)
        {
            if (id != iniciativaEntrante.id_iniciativa)
                return BadRequest("El ID de la URL no coincide.");

            var iniciativaExistente = await _context.Iniciativas.FindAsync(id);
            if (iniciativaExistente == null) return NotFound("Iniciativa no encontrada");

            iniciativaExistente.nombre = iniciativaEntrante.nombre;
            iniciativaExistente.descripcion = iniciativaEntrante.descripcion;
            iniciativaExistente.fecha_inicio = iniciativaEntrante.fecha_inicio;
            iniciativaExistente.fecha_fin = iniciativaEntrante.fecha_fin;
            iniciativaExistente.id_categoria = iniciativaEntrante.id_categoria; 
            iniciativaExistente.estado = iniciativaEntrante.estado;

            try
            {
                await _context.SaveChangesAsync();

                await _context.Entry(iniciativaExistente)
                    .Reference(i => i.id_categoriaNavigation)
                    .LoadAsync();

                return Ok(iniciativaExistente);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IniciativaExists(id)) return NotFound();
                else throw;
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador, Coordinador")]
        public async Task<IActionResult> DeleteIniciativa(int id)
        {
            var iniciativa = await _context.Iniciativas.FindAsync(id);
            if (iniciativa == null) return NotFound();

            _context.Iniciativas.Remove(iniciativa);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchIniciativas(string? search)
        {
            var query = _context.Iniciativas
                .Include(i => i.id_categoriaNavigation) 
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(i => i.nombre.Contains(search) || i.descripcion.Contains(search));
            }

            return Ok(await query.ToListAsync());
        }

        private bool IniciativaExists(int id)
        {
            return _context.Iniciativas.Any(e => e.id_iniciativa == id);
        }
    }
}