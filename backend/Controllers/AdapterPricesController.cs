using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdapterPricesController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public AdapterPricesController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<List<AdapterPrice>>> GetAll()
    {
        // Fix: SQLite cannot order by decimal, so we order in memory
        var list = await _context.AdapterPrices.ToListAsync();
        return list.OrderBy(a => a.Amperage).ToList();
    }
    
    [HttpPost]
    public async Task<ActionResult<AdapterPrice>> Create(AdapterPrice adapterPrice)
    {
        _context.AdapterPrices.Add(adapterPrice);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = adapterPrice.Id }, adapterPrice);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AdapterPrice adapterPrice)
    {
        if (id != adapterPrice.Id) return BadRequest();
        
        _context.Entry(adapterPrice).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var adapterPrice = await _context.AdapterPrices.FindAsync(id);
        if (adapterPrice == null) return NotFound();
        
        _context.AdapterPrices.Remove(adapterPrice);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
