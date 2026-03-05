using OpsDashboard.Api.Models;

namespace OpsDashboard.Api.Dtos;

public class EventQueryDto
{
    public EventStatus? Status { get; set; }
    public Severity? Severity { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
