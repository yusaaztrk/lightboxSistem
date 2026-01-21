using LightboxBackend.Data;
using LightboxBackend.Models;
using LightboxBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalculationController : ControllerBase
{
    private readonly PricingCalculationService _pricingService;
    private readonly AppDbContext _context;

    public CalculationController(PricingCalculationService pricingService, AppDbContext context)
    {
        _pricingService = pricingService;
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<CalculationBreakdown>> Calculate([FromBody] ConfigOptionsDTO config)
    {
        var settings = await _context.Settings.FirstOrDefaultAsync();
        if (settings == null)
            return BadRequest("System settings not configured");

        try 
        {
            var isDouble = config.Profile == "DOUBLE";
            
            var breakdown = await _pricingService.CalculateDetailedPrice(
                config.Width,
                config.Height,
                config.Depth,
                isDouble,
                config.LedType,
                config.Backplate,
                settings
            );

            return Ok(breakdown);
        }
        catch (System.Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class ConfigOptionsDTO
{
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public decimal Depth { get; set; }
    public string Profile { get; set; }
    public string LedType { get; set; }
    public string Backplate { get; set; }
}
