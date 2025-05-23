<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Book;
use App\Models\Author;
use App\Models\Publisher;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


use App\Models\BorrowRecord;

class BookController extends Controller
{

    public function index()
    {
        try {
            $books = Book::with(['author', 'publisher', 'categories'])->get();

                    $formattedBooks = $books->map(function ($book) {
                return [
                    'id' => $book->book_id,
                    'title' => $book->title,
                    'isbn' => $book->isbn ?? '',
                    'publicationYear' => $book->publication_year,
                    'author' => [
                        'id' => $book->author->author_id ?? null,
                        'name' => $book->author->name ?? 'Unknown',
                    ],
                    'publisher' => [
                        'id' => $book->publisher->publisher_id ?? null,
                        'name' => $book->publisher->name ?? 'Unknown',
                    ],
                    'categories' => $book->categories->map(function ($category) {
                        return [
                            'id' => $category->category_id,
                            'name' => $category->name,
                        ];
                    }),
                    'status' => $book->status,
                    'copies' => $book->total_copies,
                    'available' => $book->available_copies,
                    'location' => $book->location_in_library,
                    'description' => $book->description,
                    'edition' => $book->edition,
                ];
            });
            return response()->json($formattedBooks);
        } catch (\Exception $e) {
            Log::error('Error fetching books: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json(['error' => 'Server error occurred'], 500);
        }
    }


    public function getFormData()
    {
        $authors = Author::select('author_id', 'name')->get();
        $publishers = Publisher::select('publisher_id', 'name')->get();
        $categories = Category::select('category_id', 'name')->get();

        return response()->json([
            'authors' => $authors,
            'publishers' => $publishers,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:20',
            'author_id' => 'nullable|exists:tbl_authors,author_id',
            'publisher_id' => 'nullable|exists:tbl_publishers,publisher_id',
            'publication_year' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'total_copies' => 'nullable|integer|min:0',
            'available_copies' => 'nullable|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:tbl_categories,category_id',
            'description' => 'nullable|string',
            'location_in_library' => 'nullable|string|max:100',
            'edition' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book = new Book();
        $book->title = $request->title;
        $book->isbn = $request->isbn;
        $book->author_id = $request->author_id;
        $book->publisher_id = $request->publisher_id;
        $book->publication_year = $request->publication_year;
        $book->edition = $request->edition;
        $book->total_copies = $request->total_copies ?? 0;
        $book->available_copies = $request->available_copies ?? 0;
        $book->location_in_library = $request->location_in_library;
        $book->description = $request->description;

        if (isset($request->categories) && !empty($request->categories)) {
            $book->category_id = $request->categories[0];
        }

        $book->save();
           if (isset($request->categories)) {
            $book->categories()->sync($request->categories);
        }
        $book->load(['author', 'publisher', 'categories']);
        $formattedBook = [
            'book_id' => $book->book_id,
            'title' => $book->title,
            'isbn' => $book->isbn ?? '',
            'publication_year' => $book->publication_year,
            'author' => [
                'id' => $book->author->author_id ?? null,
                'name' => $book->author->name ?? 'Unknown',
            ],
            'publisher' => [
                'id' => $book->publisher->publisher_id ?? null,
                'name' => $book->publisher->name ?? 'Unknown',
            ],
            'categories' => $book->categories->map(function ($category) {
                return [
                    'id' => $category->category_id,
                    'name' => $category->name,
                ];
            }),
            'status' => $book->status,
            'copies' => $book->total_copies,
            'available' => $book->available_copies,
            'location' => $book->location_in_library,
            'description' => $book->description,
            'edition' => $book->edition,
        ];

        return response()->json($formattedBook, 201);
    }

    public function show($id)
    {
        $book = Book::with(['author', 'publisher', 'categories'])->findOrFail($id);
        $formattedBook = [
            'book_id' => $book->book_id,
            'title' => $book->title,
            'isbn' => $book->isbn ?? '',
            'publication_year' => $book->publication_year,
            'author' => [
                'id' => $book->author->author_id ?? null,
                'name' => $book->author->name ?? 'Unknown',
            ],
            'publisher' => [
                'id' => $book->publisher->publisher_id ?? null,
                'name' => $book->publisher->name ?? 'Unknown',
            ],
            'categories' => $book->categories->map(function ($category) {
                return [
                    'id' => $category->category_id,
                    'name' => $category->name,
                ];
            }),
            'status' => $book->status,
            'copies' => $book->total_copies,
            'available' => $book->available_copies,
            'location' => $book->location_in_library,
            'description' => $book->description,
            'edition' => $book->edition,
        ];

        return response()->json($formattedBook);
    }
    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:20',
            'author_id' => 'nullable|exists:tbl_authors,author_id',
            'publisher_id' => 'nullable|exists:tbl_publishers,publisher_id',
            'publication_year' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
            'total_copies' => 'nullable|integer|min:0',
            'available_copies' => 'nullable|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:tbl_categories,category_id',
            'description' => 'nullable|string',
            'location_in_library' => 'nullable|string|max:100',
            'edition' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book->title = $request->title;
        $book->isbn = $request->isbn;
        $book->author_id = $request->author_id;
        $book->publisher_id = $request->publisher_id;
        $book->publication_year = $request->publication_year;
        $book->edition = $request->edition;
        $book->total_copies = $request->total_copies ?? 0;
        $book->available_copies = $request->available_copies ?? 0;
        $book->location_in_library = $request->location_in_library;
        $book->description = $request->description;
        if (isset($request->categories) && !empty($request->categories)) {
            $book->category_id = $request->categories[0];
        }

        $book->save();
        if (isset($request->categories)) {
            $book->categories()->sync($request->categories);
        }
        $book->load(['author', 'publisher', 'categories']);
        $formattedBook = [
            'book_id' => $book->book_id,
            'title' => $book->title,
            'isbn' => $book->isbn ?? '',
            'publication_year' => $book->publication_year,
            'author' => [
                'id' => $book->author->author_id ?? null,
                'name' => $book->author->name ?? 'Unknown',
            ],
            'publisher' => [
                'id' => $book->publisher->publisher_id ?? null,
                'name' => $book->publisher->name ?? 'Unknown',
            ],
            'categories' => $book->categories->map(function ($category) {
                return [
                    'id' => $category->category_id,
                    'name' => $category->name,
                ];
            }),
            'status' => $book->status,
            'copies' => $book->total_copies,
            'available' => $book->available_copies,
            'location' => $book->location_in_library,
            'description' => $book->description,
            'edition' => $book->edition,
        ];

        return response()->json($formattedBook);
    }
    public function destroy($id)
    {
        $book = Book::findOrFail($id);
          $book->categories()->detach();
        $book->delete();

        return response()->json(null, 204);
    }

}