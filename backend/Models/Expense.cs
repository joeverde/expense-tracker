namespace ExpenseTracker.Api.Models;

public class Expense
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public decimal Amount { get; set; }
    public required string Description { get; set; }
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; }
}
