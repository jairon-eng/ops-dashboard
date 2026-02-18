using System.ComponentModel.DataAnnotations;
using OpsDashboard.Api.Models;

namespace OpsDashboard.Api.Dtos;

public class EventCreateDto
{
    [Required]
    [MinLength(3)]
    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public EventType Type { get; set; }

    [Required]
    public Severity Severity { get; set; }

    [Required]
    public EventSource Source { get; set; } = EventSource.Manual;
}
