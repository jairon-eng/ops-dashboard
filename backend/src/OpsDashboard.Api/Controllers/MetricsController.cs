using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpsDashboard.Api.Data;
using OpsDashboard.Api.Dtos;
using OpsDashboard.Api.Models;

namespace OpsDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetricsController : ControllerBase
{
    private readonly OpsDbContext _context;

    public MetricsController(OpsDbContext context)
    {
        _context = context;
    }
[HttpGet]
public async Task<IActionResult> Get()
{
    var todayUtc = DateTime.UtcNow.Date;

    var openCount = await _context.Events
        .AsNoTracking()
        .CountAsync(e => e.Status != EventStatus.Resolved);

    var resolvedToday = await _context.Events
        .AsNoTracking()
        .CountAsync(e =>
            e.Status == EventStatus.Resolved &&
            e.ResolvedAt.HasValue &&
            e.ResolvedAt.Value.Date == todayUtc);

   var severities = await _context.Events
    .AsNoTracking()
    .Select(e => e.Severity)
    .ToListAsync();

var bySeverity = severities
    .GroupBy(s => s)
    .ToDictionary(g => g.Key.ToString(), g => g.Count());


    var result = new MetricsDto
    {
        OpenCount = openCount,
        ResolvedToday = resolvedToday,
        BySeverity = bySeverity
    };

    return Ok(result);
}

  
}
