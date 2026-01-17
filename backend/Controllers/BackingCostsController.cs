using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackingCostsController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public BackingCostsController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<List<BackingCost>>> GetAll()
    {
        return await _context.BackingCosts.ToListAsync();
    }
    
    [HttpPost]
    public async Task<ActionResult<BackingCost>> Create(BackingCost backingCost)
    {
        _context.BackingCosts.Add(backingCost);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = backingCost.Id }, backingCost);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, BackingCost backingCost)
    {
        if (id != backingCost.Id) return BadRequest();
        
        _context.Entry(backingCost).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var backingCost = await _context.BackingCosts.FindAsync(id);
        if (backingCost == null) return NotFound();
        
        _context.BackingCosts.Remove(backingCost);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
