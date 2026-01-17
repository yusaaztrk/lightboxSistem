using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileCostsController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public ProfileCostsController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<List<ProfileCost>>> GetAll()
    {
        return await _context.ProfileCosts.ToListAsync();
    }
    
    [HttpPost]
    public async Task<ActionResult<ProfileCost>> Create(ProfileCost profileCost)
    {
        _context.ProfileCosts.Add(profileCost);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = profileCost.Id }, profileCost);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ProfileCost profileCost)
    {
        if (id != profileCost.Id) return BadRequest();
        
        _context.Entry(profileCost).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var profileCost = await _context.ProfileCosts.FindAsync(id);
        if (profileCost == null) return NotFound();
        
        _context.ProfileCosts.Remove(profileCost);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
