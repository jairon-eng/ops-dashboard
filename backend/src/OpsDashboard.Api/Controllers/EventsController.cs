using Microsoft.AspNetCore.Mvc;
using OpsDashboard.Api.Data;
using OpsDashboard.Api.Models;
using OpsDashboard.Api.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace OpsDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly OpsDbContext _context;

    public EventsController(OpsDbContext context)
    {
        _context = context;
    }
[HttpGet]
public async Task<IActionResult> GetAll([FromQuery] EventQueryDto query)
{
    var q = _context.Events.AsNoTracking().AsQueryable();

    if (query.Status.HasValue)
        q = q.Where(e => e.Status == query.Status.Value);

    if (query.Severity.HasValue)
        q = q.Where(e => e.Severity == query.Severity.Value);

    if (query.From.HasValue)
        q = q.Where(e => e.CreatedAt >= query.From.Value.ToUniversalTime());

    if (query.To.HasValue)
        q = q.Where(e => e.CreatedAt <= query.To.Value.ToUniversalTime());
        // ✅ Search by title
if (!string.IsNullOrWhiteSpace(query.Search))
{
    var s = query.Search.Trim().ToLower();

    q = q.Where(e =>
        e.Title.ToLower().Contains(s));
}

    var page = query.Page < 1 ? 1 : query.Page;
    var pageSize = query.PageSize < 1 ? 50 : query.PageSize;
    pageSize = pageSize > 100 ? 100 : pageSize;

    var totalCount = await q.CountAsync();

// ✅ Allowlist sorting (seguro)
q = query.Sort?.ToLowerInvariant() switch
{
    "createdat_asc" => q.OrderBy(e => e.CreatedAt),
    "createdat_desc" => q.OrderByDescending(e => e.CreatedAt),

    "severity_asc" => q.OrderBy(e => e.Severity).ThenByDescending(e => e.CreatedAt),
    "severity_desc" => q.OrderByDescending(e => e.Severity).ThenByDescending(e => e.CreatedAt),

    "status_asc" => q.OrderBy(e => e.Status).ThenByDescending(e => e.CreatedAt),
    "status_desc" => q.OrderByDescending(e => e.Status).ThenByDescending(e => e.CreatedAt),

    _ => q.OrderByDescending(e => e.CreatedAt)
};

var items = await q
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .Select(e => new EventListItemDto
    {
        Id = e.Id,
        Title = e.Title,
        Type = e.Type.ToString(),
        Severity = e.Severity.ToString(),
        Status = e.Status.ToString(),
        CreatedAt = e.CreatedAt
    })
    .ToListAsync();

return Ok(new PagedResult<EventListItemDto>(items, totalCount));
}
[Authorize]
[HttpPost]
public async Task<IActionResult> Create([FromBody] EventCreateDto dto)
{
    if (!ModelState.IsValid)
        return ValidationProblem(ModelState);

    var entity = new Event
    {
        Title = dto.Title.Trim(),
        Type = dto.Type,
        Severity = dto.Severity,
        Source = dto.Source,
        Status = EventStatus.Open,
        CreatedAt = DateTime.UtcNow,
        ResolvedAt = null
    };

    _context.Events.Add(entity);
    await _context.SaveChangesAsync();

    // Devolvemos 201 + Location header a GET by id (lo haremos enseguida)
    return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new
    {
        entity.Id,
        entity.Title,
        Type = entity.Type.ToString(),
        Severity = entity.Severity.ToString(),
        Status = entity.Status.ToString(),
        entity.CreatedAt
    });
}
[HttpGet("{id:guid}")]
public async Task<IActionResult> GetById(Guid id)
{
    var e = await _context.Events.FirstOrDefaultAsync(x => x.Id == id);
    if (e is null) return NotFound();

    return Ok(new EventListItemDto
    {
        Id = e.Id,
        Title = e.Title,
        Type = e.Type.ToString(),
        Severity = e.Severity.ToString(),
        Status = e.Status.ToString(),
        CreatedAt = e.CreatedAt
    });
}
[Authorize]
[HttpPatch("{id:guid}/status")]
public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateEventStatusDto dto)
{
    var entity = await _context.Events.FirstOrDefaultAsync(e => e.Id == id);

    if (entity is null)
        return NotFound();

    entity.Status = dto.Status;

    if (dto.Status == EventStatus.Resolved)
        entity.ResolvedAt = DateTime.UtcNow;
    else
        entity.ResolvedAt = null;

    await _context.SaveChangesAsync();

    return NoContent();
}




}
