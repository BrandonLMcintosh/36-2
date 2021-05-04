process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let isbn;

beforeEach(async () => {
	const res = await db.query(
		`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ('123456789', 'https://amazon.com/test', 'Test1_author', 'English', 100, 'Test1_publisher', 'test1_title', 2021)
        RETURNING isbn`
	);

	book_isbn = result.rows[0].isbn;
});

describe("book post routes", () => {
	test("create book", async () => {
		const res = await request(app).post("/books").send({
			isbn: "234567891",
			amazon_url: "https://badurl.com",
			author: "test2_author",
			language: "english",
			pages: 200,
			publisher: "test2_publisher",
			title: "test2_title",
			year: 2021,
		});
		expect(res.statusCode).toBe(201);
		expect(res.body.book).toHaveProperty("isbn");
	});

	test("prevent: no title", async () => {
		const res = await request(app).post("/books").send({ year: 2000 });
		expect(res.statusCode).toBe(400);
	});
});

describe("book get routes", () => {
	test("get one book", async () => {
		const res = await request(app).get(`/books/${book_isbn}`);
		expect(res.body.book).toHaveProperty("isbn");
		expect(res.body.book.isbn).toBe(book_isbn);
	});

	test("get nonexistent book", async () => {
		const res = await request(app).get("/books/456745673");
		expect(res.statusCode).toBe(404);
	});
});

describe("book put routes", () => {
	test("update a book", async () => {
		const res = await request(app).put(`/books/${book_isbn}`).send({
			amazon_url: "https://updated.com",
			author: "test1_author_updated",
			language: "spanish",
			pages: 101,
			publisher: "test1_publisher_updated",
			title: "test1_title_updated",
			year: 2022,
		});
		expect(res.body.book).toHaveProperty("isbn");
		expect(res.body.book.title).toBe("test1_title_updated");
	});

	test("prevent: bad update", async () => {
		const res = request(app).put(`/books/${book_isbn}`).send({
			amazon_url: "https://updated.com",
			author: "test1_author_updated",
			language: "spanish",
			pages: 101,
			invalid_property: "should fail",
			publisher: "test1_publisher_updated",
			title: "test1_title_updated",
			year: 2022,
		});
		expect(res.statusCode).toBe(400);
	});

	test("update nonexistent book", async () => {
		const res = await request(app).put("/books/565656565").send({
			amazon_url: "https://updated.com",
			author: "test1_author_updated",
			language: "spanish",
			pages: 101,
			invalid_property: "should fail",
			publisher: "test1_publisher_updated",
			title: "test1_title_updated",
			year: 2022,
		});
		expect(res.statusCode).toBe(404);
	});
});
