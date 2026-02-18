using OpsDashboard.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace OpsDashboard.Api.Data;

public class OpsDbContext : DbContext
{
    public OpsDbContext(DbContextOptions<OpsDbContext> options) : base(options) { }

    public DbSet<Event> Events => Set<Event>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Event>()
            .Property(e => e.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Event>()
            .Property(e => e.Severity)
            .HasConversion<string>();

        modelBuilder.Entity<Event>()
            .Property(e => e.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Event>()
            .Property(e => e.Source)
            .HasConversion<string>();
    }
}
