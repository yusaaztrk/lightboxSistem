using Microsoft.AspNetCore.Mvc;
using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System;
using System.Collections.Concurrent;

namespace LightboxBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        public static readonly ConcurrentDictionary<string, DateTime> AdminTokens = new();

        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        public class LoginRequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }

        [HttpPost("admin-login")]
        public async Task<IActionResult> AdminLogin([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Kullanıcı adı ve şifre gereklidir.");
            }

            var admin = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Username == request.Username);
            
            if (admin == null)
            {
                // To prevent timing attacks, we could hash a dummy password, but for now simple return
                return Unauthorized("Geçersiz kullanıcı adı veya şifre.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
            {
                return Unauthorized("Geçersiz kullanıcı adı veya şifre.");
            }

            var token = Guid.NewGuid().ToString("N");
            AdminTokens[token] = DateTime.UtcNow.AddHours(8);

            return Ok(new { success = true, message = "Giriş başarılı", token });
        }
    }
}
