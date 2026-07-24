namespace ExpenseTracker.Api.Dtos;

public record CategoryDto(int Id, string Name);

public record CreateCategoryRequest(string Name);

public record ExpenseDto(
    int Id,
    int CategoryId,
    string CategoryName,
    decimal Amount,
    string Description,
    DateOnly Date,
    DateTime CreatedAt);

public record CreateExpenseRequest(
    int CategoryId,
    decimal Amount,
    string Description,
    DateOnly Date);

public record UpdateExpenseRequest(
    int CategoryId,
    decimal Amount,
    string Description,
    DateOnly Date);

public record MonthlySummaryDto(
    int Year,
    IReadOnlyList<MonthTotalDto> Months,
    IReadOnlyList<CategoryTotalDto> ByCategory);

public record MonthTotalDto(int Month, decimal Total);

public record CategoryTotalDto(string Category, decimal Total);

public record ImportResultDto(int Imported);

public record ErrorDto(string Error);
