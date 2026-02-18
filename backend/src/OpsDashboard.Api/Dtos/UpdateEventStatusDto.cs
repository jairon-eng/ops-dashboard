using System.ComponentModel.DataAnnotations;
using OpsDashboard.Api.Models;

namespace OpsDashboard.Api.Dtos;

public class UpdateEventStatusDto
{
    [Required]
    public EventStatus Status { get; set; }
}
