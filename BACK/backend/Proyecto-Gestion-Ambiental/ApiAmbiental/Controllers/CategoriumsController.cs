using databasefirst.Contexts;
using databasefirst.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
//Steven Iñiga - 20/01/2026 - Se agregó el controlador de Categorias
//con sus respectivos endpoints para gestionar las categorías de iniciativas,
//incluyendo la lógica de autorización para que solo los administradores puedan gestionar las categorías.
namespace ApiAmbiental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]

    public class CategoriumsController : ControllerBase
    {
        private readonly AmbientalContext _context;

        public CategoriumsController(AmbientalContext context)
        {
            _context = context;
        }

        // GET: api/Categorias
        [HttpGet]
        [AllowAnonymous]

        public async Task<ActionResult<IEnumerable<Categorium>>> GetCategorias()
        {
            return await _context.Categoria.ToListAsync();
        }

        // GET: api/Categorias/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador")]

        public async Task<ActionResult<Categorium>> GetCategoria(int id)
        {
            var categoria = await _context.Categoria.FindAsync(id);

            if (categoria == null)
                return NotFound();

            return categoria;
        }

        // POST: api/Categorias
        [HttpPost]
        [Authorize(Roles = "Administrador")]


        public async Task<ActionResult<Categorium>> PostCategoria(Categorium categoria)
        {
            _context.Categoria.Add(categoria);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategoria),
                new { id = categoria.id_categoria }, categoria);
        }

        // PUT: api/Categorias/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]


        public async Task<IActionResult> PutCategoria(int id, Categorium categoria)
        {
            if (id != categoria.id_categoria)
                return BadRequest();

            _context.Entry(categoria).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Categorias/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]

        public async Task<IActionResult> DeleteCategoria(int id)
        {
            var categoria = await _context.Categoria.FindAsync(id);
            if (categoria == null)
                return NotFound();

            _context.Categoria.Remove(categoria);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
