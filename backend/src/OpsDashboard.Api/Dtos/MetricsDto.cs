namespace OpsDashboard.Api.Dtos;

public class MetricsDto
{
    public int OpenCount { get; set; }
    public int ResolvedToday { get; set; }

    public Dictionary<string, int> BySeverity { get; set; } = new();
}
