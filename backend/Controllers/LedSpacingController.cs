using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LedSpacingController : ControllerBase
{
    private readonly AppDbContext _context;

    public LedSpacingController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LedSpacingOption>>> GetOptions()
    {
        return await _context.LedSpacingOptions.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<LedSpacingOption>> AddOption([FromBody] LedSpacingOption option)
    {
        _context.LedSpacingOptions.Add(option);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOptions), new { id = option.Id }, option);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOption(int id)
    {
        var option = await _context.LedSpacingOptions.FindAsync(id);
        if (option == null) return NotFound();

        _context.LedSpacingOptions.Remove(option);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
