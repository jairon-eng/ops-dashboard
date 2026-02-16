namespace OpsDashboard.Api.Models;

public enum EventType { Incident, Maintenance, Alert }
public enum Severity { Low, Medium, High }
public enum EventStatus { Open, InProgress, Resolved }
public enum EventSource { Manual, Api }

public class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public EventType Type { get; set; }
    public Severity Severity { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Open;
    public EventSource Source { get; set; } = EventSource.Manual;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}
