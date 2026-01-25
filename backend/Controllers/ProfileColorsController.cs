using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileColorsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileColorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProfileColor>>> GetColors()
    {
        return await _context.ProfileColors.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ProfileColor>> AddColor(ProfileColor color)
    {
        _context.ProfileColors.Add(color);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetColors), new { id = color.Id }, color);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteColor(int id)
    {
        var color = await _context.ProfileColors.FindAsync(id);
        if (color == null)
            return NotFound();

        _context.ProfileColors.Remove(color);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
