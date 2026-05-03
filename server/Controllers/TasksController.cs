using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FishyTodo.API.Data;
using FishyTodo.API.Models;

namespace FishyTodo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tasks = await _db.Tasks.ToListAsync();
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create(TaskItem task)
    {
        task.CreatedAt = DateTime.UtcNow;
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }
}
