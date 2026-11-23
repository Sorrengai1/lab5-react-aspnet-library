import React from "react";
import { request } from "./api.js";

// Компонент відображення однієї книги
class Book extends React.Component {
    render() {
        const { book, onRemove, disabled } = this.props;

        return (
            <li className="book-card">
                <strong>{book.title}</strong>

                <p>Автор: {book.author}</p>
                <p>ISBN: {book.isbn}</p>
                <p>Жанр: {book.genre}</p>
                <p>Рік видання: {book.publicationYear}</p>
                <p>Кількість примірників: {book.copies}</p>

                <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Видалити ${book.title}`}
                    onClick={() => onRemove(book)}
                >
                    Видалити
                </button>
            </li>
        );
    }
}

// Компонент форми додавання книги
class BookForm extends React.Component {
    state = {
        title: "",
        author: "",
        isbn: "",
        genre: "",
        publicationYear: "",
        copies: "",
        error: ""
    };

    onSubmit = async (event) => {
        event.preventDefault();

        if (this.props.disabled) return;

        const title = this.state.title.trim();
        const author = this.state.author.trim();
        const isbn = this.state.isbn.trim();
        const genre = this.state.genre.trim();
        const publicationYear = Number(this.state.publicationYear);
        const copies = Number(this.state.copies);

        if (
            title.length < 2 || title.length > 100 ||
            author.length < 2 || author.length > 100 ||
            genre.length < 2 || genre.length > 100 ||
            !/^[0-9]{13}$/.test(isbn) ||
            this.state.publicationYear.trim() === "" ||
            !Number.isInteger(publicationYear) ||
            publicationYear < 1450 || publicationYear > 2100 ||
            this.state.copies.trim() === "" ||
            !Number.isInteger(copies) ||
            copies < 0 || copies > 1000
        ) {
            this.setState({
                error: "Перевірте правильність заповнення всіх полів."
            });
            return;
        }

        this.setState({ error: "" });

        try {
            const saved = await this.props.onBookSubmit({
                title,
                author,
                isbn,
                genre,
                publicationYear,
                copies
            });

            // Очищення форми лише після успішного додавання
            if (saved) {
                this.setState({
                    title: "",
                    author: "",
                    isbn: "",
                    genre: "",
                    publicationYear: "",
                    copies: "",
                    error: ""
                });
            }
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    render() {
        return (
            <form onSubmit={this.onSubmit} noValidate>
                <fieldset disabled={this.props.disabled}>
                    <legend>Додати книгу</legend>

                    <label htmlFor="title">Назва книги</label>
                    <input
                        id="title"
                        type="text"
                        required
                        maxLength={100}
                        value={this.state.title}
                        onChange={e =>
                            this.setState({ title: e.target.value })
                        }
                    />

                    <label htmlFor="author">Автор</label>
                    <input
                        id="author"
                        type="text"
                        required
                        maxLength={100}
                        value={this.state.author}
                        onChange={e =>
                            this.setState({ author: e.target.value })
                        }
                    />

                    <label htmlFor="isbn">ISBN (13 цифр)</label>
                    <input
                        id="isbn"
                        type="text"
                        required
                        maxLength={13}
                        inputMode="numeric"
                        value={this.state.isbn}
                        onChange={e =>
                            this.setState({ isbn: e.target.value })
                        }
                    />

                    <label htmlFor="genre">Жанр</label>
                    <input
                        id="genre"
                        type="text"
                        required
                        maxLength={100}
                        value={this.state.genre}
                        onChange={e =>
                            this.setState({ genre: e.target.value })
                        }
                    />

                    <label htmlFor="publicationYear">
                        Рік видання
                    </label>
                    <input
                        id="publicationYear"
                        type="number"
                        required
                        min="1450"
                        max="2100"
                        step="1"
                        value={this.state.publicationYear}
                        onChange={e =>
                            this.setState({
                                publicationYear: e.target.value
                            })
                        }
                    />

                    <label htmlFor="copies">
                        Кількість примірників
                    </label>
                    <input
                        id="copies"
                        type="number"
                        required
                        min="0"
                        max="1000"
                        step="1"
                        value={this.state.copies}
                        onChange={e =>
                            this.setState({ copies: e.target.value })
                        }
                    />

                    <button type="submit">Зберегти</button>
                </fieldset>

                {(this.state.error || this.props.serverError) && (
                    <p role="alert" className="error">
                        {this.state.error || this.props.serverError}
                    </p>
                )}
            </form>
        );
    }
}

// Головний компонент каталогу книг
export class BooksList extends React.Component {
    state = {
        books: [],
        loading: true,
        busy: false,
        error: "",
        search: "",
        genreFilter: "",
        sortOrder: "asc"
    };

    pending = false;

    componentDidMount() {
        this.loadData();
    }

    loadData = async () => {
        if (this.pending) return;

        this.pending = true;
        this.setState({ loading: true, error: "" });

        try {
            const books = await request("GET", this.props.apiUrl);

            if (!Array.isArray(books)) {
                throw new Error("Очікувався список книг.");
            }

            this.setState({ books });
        } catch (error) {
            this.setState({ error: error.message });
        } finally {
            this.pending = false;
            this.setState({ loading: false });
        }
    };

    onAddBook = async (input) => {
        if (this.pending) return false;

        this.pending = true;
        this.setState({ busy: true, error: "" });

        try {
            const book = await request(
                "POST",
                this.props.apiUrl,
                input
            );

            this.setState(s => ({
                books: [...s.books, book]
            }));

            return true;
        } catch (error) {
            this.setState({ error: error.message });
            return false;
        } finally {
            this.pending = false;
            this.setState({ busy: false });
        }
    };

    onRemoveBook = async (book) => {
        if (this.pending) return;

        if (!window.confirm(
            `Видалити книгу «${book.title}»?`
        )) {
            return;
        }

        this.pending = true;
        this.setState({ busy: true, error: "" });

        try {
            await request(
                "DELETE",
                `${this.props.apiUrl}/${encodeURIComponent(book.id)}`
            );

            this.setState(s => ({
                books: s.books.filter(b => b.id !== book.id)
            }));
        } catch (error) {
            this.setState({ error: error.message });
        } finally {
            this.pending = false;
            this.setState({ busy: false });
        }
    };

    render() {
        const {
            books,
            loading,
            busy,
            error,
            search,
            genreFilter,
            sortOrder
        } = this.state;

        // Список доступних жанрів
        const genres = [...new Set(
            books.map(book => book.genre)
        )].sort((a, b) => a.localeCompare(b, "uk"));

        // Пошук без урахування регістру
        const searchText = search.trim().toLocaleLowerCase("uk");

        // Одночасна фільтрація та сортування
        const visibleBooks = books
            .filter(book => {
                const matchesSearch =
                    book.title.toLocaleLowerCase("uk")
                        .includes(searchText) ||
                    book.author.toLocaleLowerCase("uk")
                        .includes(searchText);

                const matchesGenre =
                    genreFilter === "" ||
                    book.genre === genreFilter;

                return matchesSearch && matchesGenre;
            })
            .sort((a, b) =>
                sortOrder === "asc"
                    ? a.publicationYear - b.publicationYear
                    : b.publicationYear - a.publicationYear
            );

        // Підсумки лише для видимих книг
        const totalCopies = visibleBooks.reduce(
            (sum, book) => sum + book.copies,
            0
        );

        return (
            <main className="container">
                <h1>Бібліотека — каталог книг</h1>

                <BookForm
                    onBookSubmit={this.onAddBook}
                    disabled={loading || busy}
                    serverError={error}
                />

                <section>
                    <h2>Пошук і фільтрація</h2>

                    <label htmlFor="search">
                        Пошук за назвою або автором
                    </label>
                    <input
                        id="search"
                        type="search"
                        placeholder="Введіть назву або автора"
                        value={search}
                        onChange={e => this.setState({
                            search: e.target.value
                        })}
                    />

                    <label htmlFor="genreFilter">Жанр</label>
                    <select
                        id="genreFilter"
                        value={genreFilter}
                        onChange={e => this.setState({
                            genreFilter: e.target.value
                        })}
                    >
                        <option value="">Усі жанри</option>
                        {genres.map(genre => (
                            <option key={genre} value={genre}>
                                {genre}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="sortOrder">
                        Сортування за роком видання
                    </label>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={e => this.setState({
                            sortOrder: e.target.value
                        })}
                    >
                        <option value="asc">
                            Від найстаріших до найновіших
                        </option>
                        <option value="desc">
                            Від найновіших до найстаріших
                        </option>
                    </select>
                </section>

                <section>
                    <h2>Каталог книг</h2>

                    <p>
                        Кількість книг: {visibleBooks.length}
                    </p>
                    <p>
                        Загальна кількість примірників: {totalCopies}
                    </p>

                    {loading ? (
                        <p>Завантаження книг...</p>
                    ) : (
                        <>
                            {visibleBooks.length === 0 ? (
                                <p>
                                    Книг за вибраними умовами не знайдено.
                                </p>
                            ) : (
                                <ul className="books-list">
                                    {visibleBooks.map(book => (
                                        <Book
                                            key={book.id}
                                            book={book}
                                            onRemove={this.onRemoveBook}
                                            disabled={busy}
                                        />
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </section>
            </main>
        );
    }
}
