using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace LightboxBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MembershipController : ControllerBase
{
    private readonly AppDbContext _context;

    public MembershipController(AppDbContext context)
    {
        _context = context;
    }

    // --- TYPES ---
    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<MembershipType>>> GetTypes()
    {
        return await _context.MembershipTypes.ToListAsync();
    }

    [HttpPost("types")]
    public async Task<ActionResult<MembershipType>> AddType(MembershipType type)
    {
        _context.MembershipTypes.Add(type);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTypes), new { id = type.Id }, type);
    }

    [HttpPut("types/{id}")]
    public async Task<IActionResult> UpdateType(int id, MembershipType type)
    {
        if (id != type.Id) return BadRequest();
        _context.Entry(type).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("types/{id}")]
    public async Task<IActionResult> DeleteType(int id)
    {
        var type = await _context.MembershipTypes.FindAsync(id);
        if (type == null) return NotFound();
        _context.MembershipTypes.Remove(type);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // --- MEMBERSHIP ACTIONS ---

    public class RegisterRequest
    {
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string CompanyName { get; set; }
        public int MembershipTypeId { get; set; }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (await _context.Members.AnyAsync(m => m.PhoneNumber == request.PhoneNumber))
        {
            return BadRequest("Bu numara ile kayıtlı bir üye zaten var.");
        }

        var member = new Member
        {
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            CompanyName = request.CompanyName,
            MembershipTypeId = request.MembershipTypeId,
            IsApproved = false // Default
        };

        _context.Members.Add(member);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Kayıt başarılı. Admin onayı bekleniyor." });
    }

    // --- ADMIN ACTIONS ---
    
    [HttpGet("members")]
    public async Task<ActionResult<IEnumerable<object>>> GetMembers()
    {
        return await _context.Members
            .Include(m => m.MembershipType)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new 
            {
                m.Id,
                m.FullName,
                m.PhoneNumber,
                m.CompanyName,
                MembershipType = m.MembershipType.Name,
                Discount = m.MembershipType.DiscountPercentage,
                m.IsApproved,
                m.CreatedAt
            })
            .ToListAsync();
    }

    [HttpPost("approve/{id}")]
    public async Task<IActionResult> ApproveMember(int id)
    {
        var member = await _context.Members.FindAsync(id);
        if (member == null) return NotFound();

        member.IsApproved = true;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Üye onaylandı." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMember(int id)
    {
        var member = await _context.Members.FindAsync(id);
        if (member == null) return NotFound();

        _context.Members.Remove(member);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // --- CHECK DISCOUNT ---

    [HttpGet("check/{phoneNumber}")]
    public async Task<IActionResult> CheckDiscount(string phoneNumber)
    {
        var member = await _context.Members
            .Include(m => m.MembershipType)
            .FirstOrDefaultAsync(m => m.PhoneNumber == phoneNumber && m.IsApproved);

        if (member == null)
            return Ok(new { hasMembership = false, discount = 0 });

        return Ok(new { 
            hasMembership = true, 
            discount = member.MembershipType.DiscountPercentage, 
            typeName = member.MembershipType.Name,
            memberName = member.FullName
        });
    }
}
