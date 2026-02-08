using System;
using System.Linq;
using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SettingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<SystemSettings>> GetSettings()
    {
        // Get the first settings row (ID=1)
        var settings = await _context.Settings.FirstOrDefaultAsync(s => s.Id == 1);
        
        if (settings == null)
        {
            // If doesn't exist, create default
            settings = new SystemSettings { Id = 1 };
            _context.Settings.Add(settings);
            await _context.SaveChangesAsync();
        }

        return Ok(settings);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateSettings([FromBody] SystemSettings settings)
    {
        if (settings.Id != 1) settings.Id = 1; // Enforce singleton-like behavior

        var existing = await _context.Settings.FirstOrDefaultAsync(s => s.Id == 1);
        if (existing == null)
        {
            _context.Settings.Add(settings);
        }
        else
        {
            // Robust update using EF SetValues
            _context.Entry(existing).CurrentValues.SetValues(settings);
            
            // Explicitly force Id=1 to prevent accidental changes
            existing.Id = 1;
        }

        await _context.SaveChangesAsync();
        
        // Return the actual saved settings
        var saved = await _context.Settings.FirstOrDefaultAsync(s => s.Id == 1);
        return Ok(saved);
    }
}
