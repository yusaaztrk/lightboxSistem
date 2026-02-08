using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpinWheelController : ControllerBase
{
    private readonly AppDbContext _context;

    public SpinWheelController(AppDbContext context)
    {
        _context = context;
    }

    private static string NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        return digits;
    }

    // --- STATUS ---
    [HttpGet("status")]
    public async Task<IActionResult> GetWheelStatus()
    {
        var settings = await _context.Settings.FirstOrDefaultAsync();
        return Ok(new { isEnabled = settings?.IsWheelEnabled ?? true });
    }

    // --- CONFIGURATION ---

    [HttpGet("config")]
    public async Task<ActionResult<IEnumerable<SpinWheelItem>>> GetConfig()
    {
        var items = await _context.SpinWheelItems.ToListAsync();
        if (items.Count == 0)
        {
            // Seed default items
            var defaults = new List<SpinWheelItem>
            {
                new SpinWheelItem { Label = "%5 İNDİRİM", DiscountPercentage = 5, Probability = 30, ColorHex = "#8B5CF6", IsLoss = false }, // Purple
                new SpinWheelItem { Label = "%10 İNDİRİM", DiscountPercentage = 10, Probability = 20, ColorHex = "#DB2777", IsLoss = false }, // Pink
                new SpinWheelItem { Label = "%15 İNDİRİM", DiscountPercentage = 15, Probability = 10, ColorHex = "#10B981", IsLoss = false }, // Emerald
                new SpinWheelItem { Label = "PAS", DiscountPercentage = 0, Probability = 20, ColorHex = "#6B7280", IsLoss = true }, // Gray
                new SpinWheelItem { Label = "%20 İNDİRİM", DiscountPercentage = 20, Probability = 5, ColorHex = "#F59E0B", IsLoss = false }, // Aamber
                new SpinWheelItem { Label = "TEKRAR DENE", DiscountPercentage = 0, Probability = 15, ColorHex = "#EF4444", IsLoss = true } // Red
            };

            _context.SpinWheelItems.AddRange(defaults);
            await _context.SaveChangesAsync();
            return defaults;
        }

        return items;
    }

    [HttpPost("config")]
    public async Task<ActionResult<SpinWheelItem>> AddItem(SpinWheelItem item)
    {
        _context.SpinWheelItems.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetConfig), new { id = item.Id }, item);
    }

    [HttpDelete("config/{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.SpinWheelItems.FindAsync(id);
        if (item == null) return NotFound();

        _context.SpinWheelItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // --- ACTION ---

    public class SpinRequest
    {
        public string PhoneNumber { get; set; }
    }

    [HttpPost("spin")]
    public async Task<IActionResult> Spin([FromBody] SpinRequest request)
    {
        // Check if wheel is enabled
        var settings = await _context.Settings.FirstOrDefaultAsync();
        if (settings != null && !settings.IsWheelEnabled)
            return BadRequest("Şans çarkı şu anda devre dışıdır.");

        var phone = NormalizePhone(request.PhoneNumber);
        if (string.IsNullOrEmpty(phone))
            return BadRequest("Telefon numarası gereklidir.");

        // Check for existing participation
        if (await _context.Leads.AnyAsync(l => l.PhoneNumber == phone))
        {
            return BadRequest("Bu numara ile daha önce katılım sağlanmış!");
        }

        // 1. Get Setup
        var items = await _context.SpinWheelItems.ToListAsync();
        if (items.Count == 0) return BadRequest("Çark ayarları yapılmamış.");

        // 2. Calculate Winner
        // Weighted random selection
        var totalWeight = items.Sum(i => i.Probability);
        var rand = new Random();
        var roll = rand.NextDouble() * totalWeight;

        SpinWheelItem wonItem = null;
        double currentWeight = 0;
        foreach (var item in items)
        {
            currentWeight += item.Probability;
            if (roll <= currentWeight)
            {
                wonItem = item;
                break;
            }
        }
        if (wonItem == null) wonItem = items.Last(); // Fallback

        // 3. Generate Code if not loss
        string code = "";
        if (!wonItem.IsLoss)
        {
            code = "LUCKY" + rand.Next(1000, 9999);
        }

        // 4. Save Lead
        var lead = new CustomerLead
        {
            PhoneNumber = phone,
            WonPrizeLabel = wonItem.Label,
            DiscountCode = code,
            DiscountPercentage = (!wonItem.IsLoss && wonItem.DiscountPercentage > 0) ? wonItem.DiscountPercentage : 0,
            CreatedAt = DateTime.UtcNow
        };
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        return Ok(new { 
            wonItemId = wonItem.Id, 
            wonLabel = wonItem.Label, 
            discountCode = code,
            isLoss = wonItem.IsLoss 
        });
    }

    // --- VALIDATION ---
    public class ValidateRequest
    {
        public string Code { get; set; }
        public string PhoneNumber { get; set; }
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCode([FromBody] ValidateRequest request)
    {
        if (string.IsNullOrEmpty(request.Code)) return BadRequest("Kod boş olamaz.");
        if (string.IsNullOrEmpty(request.PhoneNumber)) return BadRequest("Telefon numarası gereklidir.");

        var phone = NormalizePhone(request.PhoneNumber);
        if (string.IsNullOrEmpty(phone)) return BadRequest("Telefon numarası gereklidir.");

        var lead = await _context.Leads.FirstOrDefaultAsync(l => l.DiscountCode == request.Code && !l.IsUsed);
        
        if (lead == null)
            return BadRequest("Geçersiz veya kullanılmış kod.");

        // Normalize phones for comparison (strip spaces etc if needed, but for now exact match)
        if (NormalizePhone(lead.PhoneNumber) != phone)
            return BadRequest("Bu kod başka bir numaraya tanımlıdır.");
        
        return Ok(new { percentage = lead.DiscountPercentage, owner = lead.PhoneNumber });
    }

    // --- DATA ---
    [HttpGet("leads")]
    public async Task<ActionResult<IEnumerable<CustomerLead>>> GetLeads()
    {
        return await _context.Leads.OrderByDescending(l => l.CreatedAt).ToListAsync();
    }

    [HttpDelete("lead/{id}")]
    public async Task<IActionResult> DeleteLead(int id)
    {
        var lead = await _context.Leads.FindAsync(id);
        if (lead == null) return NotFound();
        _context.Leads.Remove(lead);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
