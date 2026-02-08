using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/discountcodes")]
public class DiscountCodesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DiscountCodesController(AppDbContext context)
    {
        _context = context;
    }

    private static string NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        return digits;
    }

    public class CreateDiscountCodeRequest
    {
        public string? PhoneNumber { get; set; }
        public int DiscountPercentage { get; set; }
        public string? Code { get; set; }
        public string? Label { get; set; }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var list = await _context.Leads
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(list);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDiscountCodeRequest request)
    {
        try
        {
            if (request.DiscountPercentage <= 0 || request.DiscountPercentage > 100) return BadRequest("İndirim oranı 1-100 arasında olmalıdır.");

            var code = (request.Code ?? string.Empty).Trim().ToUpperInvariant();
            if (string.IsNullOrEmpty(code))
            {
                code = "MANUAL" + new Random().Next(1000, 9999);
            }

            var exists = await _context.Leads.AnyAsync(l => l.DiscountCode == code);
            if (exists) return BadRequest("Bu indirim kodu zaten mevcut.");

            var lead = new CustomerLead
            {
                PhoneNumber = NormalizePhone(request.PhoneNumber) ?? string.Empty,
                WonPrizeLabel = string.IsNullOrWhiteSpace(request.Label) ? "MANUAL" : request.Label!,
                DiscountCode = code,
                DiscountPercentage = request.DiscountPercentage,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Leads.Add(lead);
            await _context.SaveChangesAsync();

            return Ok(lead);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var lead = await _context.Leads.FindAsync(id);
            if (lead == null) return NotFound();

            _context.Leads.Remove(lead);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }
}
