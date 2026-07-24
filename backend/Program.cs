using System.Globalization;
using System.Text;
using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.Dtos;
using ExpenseTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ExpenseDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ExpenseDbContext>();
    db.Database.EnsureCreated();
    await SeedData.InitializeAsync(db);
}

var categories = app.MapGroup("/api/categories").WithTags("Categories");

categories.MapGet("/", async (ExpenseDbContext db) =>
{
    var items = await db.Categories
        .OrderBy(c => c.Name)
        .Select(c => new CategoryDto(c.Id, c.Name))
        .ToListAsync();
    return Results.Ok(items);
});

categories.MapPost("/", async (CreateCategoryRequest request, ExpenseDbContext db) =>
{
    var name = request.Name?.Trim();
    if (string.IsNullOrWhiteSpace(name))
        return Results.BadRequest(new ErrorDto("Category name is required."));

    if (await db.Categories.AnyAsync(c => c.Name == name))
        return Results.Conflict(new ErrorDto($"Category '{name}' already exists."));

    var category = new Category { Name = name };
    db.Categories.Add(category);
    await db.SaveChangesAsync();

    return Results.Created($"/api/categories/{category.Id}", new CategoryDto(category.Id, category.Name));
});

var expenses = app.MapGroup("/api/expenses").WithTags("Expenses");

expenses.MapGet("/", async (
    ExpenseDbContext db,
    DateOnly? from,
    DateOnly? to,
    int? categoryId) =>
{
    var query = db.Expenses
        .Include(e => e.Category)
        .AsQueryable();

    if (from.HasValue)
        query = query.Where(e => e.Date >= from.Value);

    if (to.HasValue)
        query = query.Where(e => e.Date <= to.Value);

    if (categoryId.HasValue)
        query = query.Where(e => e.CategoryId == categoryId.Value);

    var items = await query
        .OrderByDescending(e => e.Date)
        .ThenByDescending(e => e.Id)
        .Select(e => new ExpenseDto(
            e.Id,
            e.CategoryId,
            e.Category.Name,
            e.Amount,
            e.Description,
            e.Date,
            e.CreatedAt))
        .ToListAsync();

    return Results.Ok(items);
});

expenses.MapPost("/", async (CreateExpenseRequest request, ExpenseDbContext db) =>
{
    var validation = await ValidateExpenseRequest(db, request.CategoryId, request.Amount, request.Description);
    if (validation is not null)
        return validation;

    var expense = new Expense
    {
        CategoryId = request.CategoryId,
        Amount = request.Amount,
        Description = request.Description.Trim(),
        Date = request.Date,
        CreatedAt = DateTime.UtcNow
    };

    db.Expenses.Add(expense);
    await db.SaveChangesAsync();

    await db.Entry(expense).Reference(e => e.Category).LoadAsync();

    return Results.Created(
        $"/api/expenses/{expense.Id}",
        new ExpenseDto(
            expense.Id,
            expense.CategoryId,
            expense.Category.Name,
            expense.Amount,
            expense.Description,
            expense.Date,
            expense.CreatedAt));
});

expenses.MapPut("/{id:int}", async (int id, UpdateExpenseRequest request, ExpenseDbContext db) =>
{
    var expense = await db.Expenses.Include(e => e.Category).FirstOrDefaultAsync(e => e.Id == id);
    if (expense is null)
        return Results.NotFound(new ErrorDto($"Expense {id} not found."));

    var validation = await ValidateExpenseRequest(db, request.CategoryId, request.Amount, request.Description);
    if (validation is not null)
        return validation;

    expense.CategoryId = request.CategoryId;
    expense.Amount = request.Amount;
    expense.Description = request.Description.Trim();
    expense.Date = request.Date;

    await db.SaveChangesAsync();
    await db.Entry(expense).Reference(e => e.Category).LoadAsync();

    return Results.Ok(new ExpenseDto(
        expense.Id,
        expense.CategoryId,
        expense.Category.Name,
        expense.Amount,
        expense.Description,
        expense.Date,
        expense.CreatedAt));
});

expenses.MapDelete("/{id:int}", async (int id, ExpenseDbContext db) =>
{
    var expense = await db.Expenses.FindAsync(id);
    if (expense is null)
        return Results.NotFound(new ErrorDto($"Expense {id} not found."));

    db.Expenses.Remove(expense);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

expenses.MapPost("/import-csv", async (HttpRequest request, ExpenseDbContext db) =>
{
    string csvContent;

    if (request.HasFormContentType && request.Form.Files.Count > 0)
    {
        var file = request.Form.Files[0];
        using var reader = new StreamReader(file.OpenReadStream());
        csvContent = await reader.ReadToEndAsync();
    }
    else
    {
        using var reader = new StreamReader(request.Body, Encoding.UTF8);
        csvContent = await reader.ReadToEndAsync();
    }

    if (string.IsNullOrWhiteSpace(csvContent))
        return Results.BadRequest(new ErrorDto("CSV content is required."));

    var lines = csvContent
        .Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    var imported = 0;

    foreach (var line in lines)
    {
        if (line.StartsWith("date,", StringComparison.OrdinalIgnoreCase))
            continue;

        var parts = ParseCsvLine(line);
        if (parts.Length < 3)
            continue;

        if (!TryParseDate(parts[0], out var date))
            continue;

        if (!decimal.TryParse(parts[1], NumberStyles.Number, CultureInfo.InvariantCulture, out var amount) || amount <= 0)
            continue;

        var categoryName = parts[2].Trim();
        if (string.IsNullOrWhiteSpace(categoryName))
            continue;

        var description = parts.Length > 3 ? parts[3].Trim() : string.Empty;

        var category = await db.Categories.FirstOrDefaultAsync(c => c.Name == categoryName);
        if (category is null)
        {
            category = new Category { Name = categoryName };
            db.Categories.Add(category);
            await db.SaveChangesAsync();
        }

        db.Expenses.Add(new Expense
        {
            CategoryId = category.Id,
            Amount = amount,
            Description = description,
            Date = date,
            CreatedAt = DateTime.UtcNow
        });

        imported++;
    }

    if (imported > 0)
        await db.SaveChangesAsync();

    return Results.Ok(new ImportResultDto(imported));
});

var summary = app.MapGroup("/api/summary").WithTags("Summary");

summary.MapGet("/monthly", async (ExpenseDbContext db, int? year) =>
{
    var targetYear = year ?? DateTime.UtcNow.Year;

    var expensesForYear = await db.Expenses
        .Include(e => e.Category)
        .Where(e => e.Date.Year == targetYear)
        .ToListAsync();

    var months = Enumerable.Range(1, 12)
        .Select(month => new MonthTotalDto(
            month,
            expensesForYear.Where(e => e.Date.Month == month).Sum(e => e.Amount)))
        .ToList();

    var byCategory = expensesForYear
        .GroupBy(e => e.Category.Name)
        .Select(g => new CategoryTotalDto(g.Key, g.Sum(e => e.Amount)))
        .OrderByDescending(c => c.Total)
        .ToList();

    return Results.Ok(new MonthlySummaryDto(targetYear, months, byCategory));
});

app.Run();

static async Task<IResult?> ValidateExpenseRequest(
    ExpenseDbContext db,
    int categoryId,
    decimal amount,
    string description)
{
    if (amount <= 0)
        return Results.BadRequest(new ErrorDto("Amount must be greater than zero."));

    if (string.IsNullOrWhiteSpace(description))
        return Results.BadRequest(new ErrorDto("Description is required."));

    if (!await db.Categories.AnyAsync(c => c.Id == categoryId))
        return Results.BadRequest(new ErrorDto($"Category {categoryId} not found."));

    return null;
}

static bool TryParseDate(string value, out DateOnly date)
{
    if (DateOnly.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
        return true;

    return DateOnly.TryParseExact(value, ["yyyy-MM-dd", "yyyy/MM/dd"], CultureInfo.InvariantCulture, DateTimeStyles.None, out date);
}

static string[] ParseCsvLine(string line)
{
    var parts = new List<string>();
    var current = new StringBuilder();
    var inQuotes = false;

    for (var i = 0; i < line.Length; i++)
    {
        var c = line[i];

        if (c == '"')
        {
            inQuotes = !inQuotes;
            continue;
        }

        if (c == ',' && !inQuotes)
        {
            parts.Add(current.ToString());
            current.Clear();
            continue;
        }

        current.Append(c);
    }

    parts.Add(current.ToString());
    return parts.ToArray();
}

public partial class Program;
