using ApiAmbiental.Models;
using databasefirst.Contexts;
using databasefirst.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ApiAmbiental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AmbientalContext _context; 

        public AuthController(IConfiguration configuration, AmbientalContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel login)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.correo == login.Correo && u.contrasena == login.Contrasena);

            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });
            }
            if (usuario.estado != "Activo")
            {
                return StatusCode(403, "Tu cuenta está desactivada. Contacta al administrador.");
            }

            var token = GenerateToken(usuario);

            return Ok(new { token });
        }

        private string GenerateToken(Usuario usuario)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings").Get<JwtSettings>();
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("id_user", usuario.id_user.ToString()),
                new Claim("username", usuario.nombre),
                new Claim("role", usuario.rol)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(jwtSettings.ExpireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginModel
    {
        public string Correo { get; set; } = null!;
        public string Contrasena { get; set; } = null!;
    }
}
