namespace ReactApp.Models;

public sealed class Book
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public string Isbn { get; set; } = "";
    public string Genre { get; set; } = "";
    public int PublicationYear { get; set; }
    public int Copies { get; set; }
}
