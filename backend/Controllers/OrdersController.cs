using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LightboxBackend.Data;
using LightboxBackend.Models;
using System.Security.Cryptography;
using System.Text.Json;

namespace LightboxBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdminRequest()
        {
            if (!Request.Headers.TryGetValue("X-Admin-Token", out var token)) return false;
            var t = token.ToString();
            if (string.IsNullOrWhiteSpace(t)) return false;
            if (!AuthController.AdminTokens.TryGetValue(t, out var exp)) return false;
            if (exp < DateTime.UtcNow)
            {
                AuthController.AdminTokens.TryRemove(t, out _);
                return false;
            }
            return true;
        }

        private static string GenerateAccessCode()
        {
            var bytes = RandomNumberGenerator.GetBytes(16);
            return Convert.ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
        }

        private static string? TryReadAccessCodeFromConfig(string? configurationDetails)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(configurationDetails)) return null;
                using var doc = JsonDocument.Parse(configurationDetails);
                if (doc.RootElement.ValueKind != JsonValueKind.Object) return null;
                if (doc.RootElement.TryGetProperty("accessCode", out var prop) && prop.ValueKind == JsonValueKind.String)
                {
                    return prop.GetString();
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        private static string EnsureAccessCodeInConfig(string? configurationDetails, string accessCode)
        {
            try
            {
                var dict = new Dictionary<string, object?>();
                if (!string.IsNullOrWhiteSpace(configurationDetails))
                {
                    dict = JsonSerializer.Deserialize<Dictionary<string, object?>>(configurationDetails) ?? new Dictionary<string, object?>();
                }

                dict["accessCode"] = accessCode;
                return JsonSerializer.Serialize(dict);
            }
            catch
            {
                return JsonSerializer.Serialize(new Dictionary<string, object?> { { "accessCode", accessCode } });
            }
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            if (!IsAdminRequest()) return Forbid();
            return await _context.Orders.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        // GET: api/Orders/public/5?code=XXXX
        [HttpGet("public/{id}")]
        public async Task<ActionResult<Order>> GetOrderPublic(int id, [FromQuery] string code)
        {
            if (string.IsNullOrWhiteSpace(code)) return Unauthorized("Erişim kodu gereklidir.");

            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            var stored = TryReadAccessCodeFromConfig(order.ConfigurationDetails);
            if (string.IsNullOrWhiteSpace(stored)) return Unauthorized("Bu sipariş için erişim kodu bulunamadı.");
            if (!string.Equals(stored, code, StringComparison.Ordinal)) return Unauthorized("Geçersiz erişim kodu.");

            return order;
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            if (!IsAdminRequest()) return Forbid();
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            if (!string.IsNullOrWhiteSpace(order.ConfigurationDetails))
            {
                // ok
            }

            // Simple Validation
            if (string.IsNullOrWhiteSpace(order.CustomerName) || string.IsNullOrWhiteSpace(order.CustomerPhone))
            {
                return BadRequest("Müşteri Adı ve Telefonu zorunludur.");
            }

            order.CreatedAt = DateTime.UtcNow;
            if (string.IsNullOrEmpty(order.Status))
            {
                order.Status = "Pending";
            }

            // Ensure an accessCode exists for customer order view.
            var accessCode = TryReadAccessCodeFromConfig(order.ConfigurationDetails);
            if (string.IsNullOrWhiteSpace(accessCode))
            {
                accessCode = GenerateAccessCode();
                order.ConfigurationDetails = EnsureAccessCodeInConfig(order.ConfigurationDetails, accessCode);
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetOrders", new { id = order.Id }, order);
        }
        
        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            if (!IsAdminRequest()) return Forbid();
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (!IsAdminRequest()) return Forbid();
            if (id != order.Id)
            {
                return BadRequest();
            }

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
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

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }
    }
}
