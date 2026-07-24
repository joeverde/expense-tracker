using ExpenseTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(ExpenseDbContext db)
    {
        if (await db.Categories.AnyAsync())
            return;

        var categories = new[]
        {
            new Category { Name = "Food" },
            new Category { Name = "Rent" },
            new Category { Name = "Transport" },
            new Category { Name = "Utilities" },
            new Category { Name = "Entertainment" }
        };

        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();

        var categoryMap = await db.Categories.ToDictionaryAsync(c => c.Name, c => c.Id);
        var now = DateTime.UtcNow;
        var year = now.Year;

        var expenses = new[]
        {
            new Expense { CategoryId = categoryMap["Rent"], Amount = 1450.00m, Description = "Monthly rent", Date = new DateOnly(year, 1, 1), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Food"], Amount = 86.42m, Description = "Groceries at Whole Foods", Date = new DateOnly(year, 1, 8), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Transport"], Amount = 45.00m, Description = "Monthly transit pass", Date = new DateOnly(year, 1, 10), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Utilities"], Amount = 112.30m, Description = "Electric bill", Date = new DateOnly(year, 1, 15), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Entertainment"], Amount = 28.50m, Description = "Movie night", Date = new DateOnly(year, 1, 20), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Food"], Amount = 62.18m, Description = "Restaurant dinner", Date = new DateOnly(year, 2, 3), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Rent"], Amount = 1450.00m, Description = "Monthly rent", Date = new DateOnly(year, 2, 1), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Transport"], Amount = 18.75m, Description = "Ride share", Date = new DateOnly(year, 2, 14), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Utilities"], Amount = 98.60m, Description = "Internet bill", Date = new DateOnly(year, 2, 18), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Entertainment"], Amount = 15.99m, Description = "Streaming subscription", Date = new DateOnly(year, 3, 1), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Food"], Amount = 94.27m, Description = "Weekly groceries", Date = new DateOnly(year, 3, 9), CreatedAt = now },
            new Expense { CategoryId = categoryMap["Transport"], Amount = 52.00m, Description = "Gas fill-up", Date = new DateOnly(year, 3, 12), CreatedAt = now }
        };

        db.Expenses.AddRange(expenses);
        await db.SaveChangesAsync();
    }
}
