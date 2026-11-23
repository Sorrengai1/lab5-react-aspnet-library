using System.ComponentModel.DataAnnotations;

namespace ReactApp.Models;

public sealed class BookInput
{
    [Required(ErrorMessage = "Вкажіть назву книги.")]
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Назва: від 2 до 100 символів.")]
    public string Title { get; set; } = "";

    [Required(ErrorMessage = "Вкажіть автора.")]
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Автор: від 2 до 100 символів.")]
    public string Author { get; set; } = "";

    [Required(ErrorMessage = "Вкажіть ISBN.")]
    [RegularExpression(@"^[0-9]{13}$",
        ErrorMessage = "ISBN повинен містити рівно 13 цифр.")]
    public string Isbn { get; set; } = "";

    [Required(ErrorMessage = "Вкажіть жанр.")]
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Жанр: від 2 до 100 символів.")]
    public string Genre { get; set; } = "";

    [Range(1450, 2100,
        ErrorMessage = "Рік видання: від 1450 до 2100.")]
    public int PublicationYear { get; set; }

    [Range(0, 1000,
        ErrorMessage = "Кількість примірників: від 0 до 1000.")]
    public int Copies { get; set; }
}
