using Microsoft.EntityFrameworkCore;
using OpsDashboard.Api.Models;

namespace OpsDashboard.Api.Data;

public class OpsDbContext : DbContext
{
    public OpsDbContext(DbContextOptions<OpsDbContext> options) : base(options) { }

    public DbSet<Event> Events => Set<Event>();
}
