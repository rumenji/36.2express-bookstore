process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let testBook;

describe("Get Book Routes test", function(){
    

    beforeEach(async function (){
        await db.query("DELETE FROM books;")

        const book1 = await Book.create({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
          })
        testBook = book1;
    })

    test("get all books", async function(){
        const response = await request(app).get("/books");
        expect(response.body).toEqual({books: [testBook]})
    })

    test("get one book", async function(){
        const response = await request(app).get(`/books/${testBook.isbn}`);
        expect(response.body).toEqual({book: testBook})
    })

    test("404 for no book found", async function () {
        const response = await request(app)
            .get(`/books/999`)
        expect(response.statusCode).toBe(404);
      });
})

describe("POST Create books", function(){

    beforeEach(async function (){
       
        await db.query("DELETE FROM books;")

    })

    test("create a new book", async function(){
        const response = await request(app).post("/books")
                                           .send(
                                            {
                                                "isbn": "0691161518",
                                                "amazon_url": "http://a.co/eobPtX2",
                                                "author": "Matthew Lane",
                                                "language": "english",
                                                "pages": 264,
                                                "publisher": "Princeton University Press",
                                                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                                                "year": 2017
                                              }
                                           ) 
        expect(response.body).toEqual({book: {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
          }})
    })

    test("cannot duplicate", async function(){
        const response1 = await request(app).post("/books")
        .send(
         {
             "isbn": "0691161518",
             "amazon_url": "http://a.co/eobPtX2",
             "author": "Matthew Lane",
             "language": "english",
             "pages": 264,
             "publisher": "Princeton University Press",
             "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
             "year": 2017
           }
        )
        const response2 = await request(app).post("/books")
        .send(
         {
             "isbn": "0691161518",
             "amazon_url": "http://a.co/eobPtX2",
             "author": "Matthew Lane",
             "language": "english",
             "pages": 264,
             "publisher": "Princeton University Press",
             "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
             "year": 2017
           }
        )
        expect(response2.statusCode).toEqual(500);
    })
})

describe("Update books", function(){
    test("update", async function(){
        const response = await request(app).put(`/books/${testBook.isbn}`)
                                            .send({
                                                "amazon_url": "http://a.co/eobPtX2",
             "author": "Matthew Lane",
             "language": "english",
             "pages": 264,
             "publisher": "Princeton University Press",
             "title": "New updated title",
             "year": 2017
                                            })
        expect(response.body.book.title).toBe("New updated title")
    })
})

describe("Delete book", function(){
    test("delete", async function(){
        const response = await request(app).delete(`/books/${testBook.isbn}`)
        expect(response.body).toEqual({message: "Book deleted"});
    })
})

describe("JSON Validation", function(){
    test("Incorrect entry", async function (){
        const response = await request(app).post("/books")
        .send(
         {
             "isbn": "0691161517",
             "amazon_url": "http://a.co/eobPtX2",
             "author": "Matthew Lane",
             "language": "english",
             "pages": 264,
             "publisher": "Princeton University Press",
             "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games"
           }
        )
        expect(response.statusCode).toEqual(400)
    })
})

afterAll(async function(){
    await db.end();
})
