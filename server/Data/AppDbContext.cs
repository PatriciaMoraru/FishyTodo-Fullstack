using Microsoft.EntityFrameworkCore;
using FishyTodo.API.Models;

namespace FishyTodo.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
}
