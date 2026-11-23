using Microsoft.AspNetCore.Mvc;
using ReactApp.Models;

namespace ReactApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class BooksController : ControllerBase
{
	private static readonly object Gate = new();

	private static readonly List<Book> Data = new()
	{
		new() {
			Id = Guid.NewGuid().ToString(),
			Title = "Кобзар",
			Author = "Тарас Шевченко",
			Isbn = "9789660000001",
			Genre = "Поезія",
			PublicationYear = 1840,
			Copies = 12
		},
		new() {
			Id = Guid.NewGuid().ToString(),
			Title = "Лісова пісня",
			Author = "Леся Українка",
			Isbn = "9789660000002",
			Genre = "Драма",
			PublicationYear = 1911,
			Copies = 8
		},
		new() {
			Id = Guid.NewGuid().ToString(),
			Title = "Тигролови",
			Author = "Іван Багряний",
			Isbn = "9789660000003",
			Genre = "Роман",
			PublicationYear = 1944,
			Copies = 5
		},
		new() {
			Id = Guid.NewGuid().ToString(),
			Title = "Місто",
			Author = "Валер'ян Підмогильний",
			Isbn = "9789660000004",
			Genre = "Роман",
			PublicationYear = 1928,
			Copies = 10
		},
		new() {
			Id = Guid.NewGuid().ToString(),
			Title = "Захар Беркут",
			Author = "Іван Франко",
			Isbn = "9789660000005",
			Genre = "Повість",
			PublicationYear = 1883,
			Copies = 7
		},
		new() {
			Id = Guid.NewGuid().ToString(),
			Title = "Енеїда",
			Author = "Іван Котляревський",
			Isbn = "9789660000006",
			Genre = "Поезія",
			PublicationYear = 1798,
			Copies = 0
		},
		new() {
			Id = Guid.NewGuid().ToString(),
			Title = "Чорна рада",
			Author = "Пантелеймон Куліш",
			Isbn = "9789660000007",
			Genre = "Роман",
			PublicationYear = 1857,
			Copies = 6
		},
		new() {
			Id = Guid.NewGuid().ToString(),
			Title = "Кайдашева сім'я",
			Author = "Іван Нечуй-Левицький",
			Isbn = "9789660000008",
			Genre = "Повість",
			PublicationYear = 1879,
			Copies = 9
		}
	};

	[HttpGet]
	public ActionResult<Book[]> Get()
	{
		lock (Gate)
		{
			return Ok(Data.ToArray());
		}
	}

	[HttpPost]
	public ActionResult<Book> Post([FromBody] BookInput input)
	{
		string title = input.Title?.Trim() ?? "";
		string author = input.Author?.Trim() ?? "";
		string isbn = input.Isbn?.Trim() ?? "";
		string genre = input.Genre?.Trim() ?? "";

		if (title.Length < 2 || title.Length > 100 ||
			author.Length < 2 || author.Length > 100 ||
			genre.Length < 2 || genre.Length > 100)
		{
			return BadRequest(new
			{
				detail = "Текстові поля повинні містити від 2 до 100 символів."
			});
		}

		if (!System.Text.RegularExpressions.Regex.IsMatch(
				isbn, @"^[0-9]{13}$"))
		{
			return BadRequest(new
			{
				detail = "ISBN повинен містити рівно 13 цифр."
			});
		}

		lock (Gate)
		{
			if (Data.Any(b => string.Equals(
				b.Isbn, isbn,
				StringComparison.OrdinalIgnoreCase)))
			{
				return Conflict(new
				{
					detail = "Книга з таким ISBN вже існує."
				});
			}

			var book = new Book
			{
				Id = Guid.NewGuid().ToString(),
				Title = title,
				Author = author,
				Isbn = isbn,
				Genre = genre,
				PublicationYear = input.PublicationYear,
				Copies = input.Copies
			};

			Data.Add(book);
			return Ok(book);
		}
	}

	[HttpDelete("{id}")]
	public ActionResult<Book> Delete(string id)
	{
		lock (Gate)
		{
			var book = Data.FirstOrDefault(b => b.Id == id);

			if (book is null)
			{
				return NotFound(new
				{
					detail = "Книгу не знайдено."
				});
			}

			Data.Remove(book);
			return Ok(book);
		}
	}
}
