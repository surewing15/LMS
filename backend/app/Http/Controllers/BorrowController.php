<?php
namespace App\Http\Controllers;

use App\Models\BorrowRecord;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;

class BorrowController extends Controller
{

    public function index()
    {
        $borrowRecords = BorrowRecord::with('book.author')
            ->where('user_id', Auth::id())
            ->whereNull('returned_at')
            ->get();

        return response()->json($borrowRecords);
    }

    public function store(Request $request)
    {
        Log::info('Borrow request data:', $request->all());

        $request->validate([
            'book_id' => 'required|exists:tbl_books,book_id',
        ]);
        $book = Book::where('book_id', $request->book_id)->first();

        if (!$book) {
            return response()->json([
                'message' => 'Book not found'
            ], 404);
        }
        if ($book->available_copies <= 0) {
            return response()->json([
                'message' => 'This book is currently unavailable'
            ], 400);
        }
        $borrowRecord = new BorrowRecord();
        $borrowRecord->user_id = Auth::id();
        $borrowRecord->book_id = $request->book_id;
        $borrowRecord->borrowed_at = Carbon::now();
        $borrowRecord->due_at = Carbon::now()->addDays(14); // Default 14 days loan period
        $borrowRecord->status = 'borrowed';
        $borrowRecord->save();
        $book->available_copies = $book->available_copies - 1;
        $book->save();

        return response()->json([
            'message' => 'Book borrowed successfully',
            'data' => $borrowRecord->load('book.author')
        ], 201);
    }
    public function returnBook($id)
    {

        Log::info('Return book request', [
            'record_id' => $id,
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->role
        ]);


        if (Auth::user()->role === 'admin' || Auth::user()->role === 'librarian') {
            $borrowRecord = BorrowRecord::where('id', $id)
                ->whereNull('returned_at')
                ->first();
        } else {

            $borrowRecord = BorrowRecord::where('id', $id)
                ->where('user_id', Auth::id())
                ->whereNull('returned_at')
                ->first();
        }

        if (!$borrowRecord) {
            Log::warning('Borrow record not found or already returned', [
                'record_id' => $id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Borrow record not found or already returned'
            ], 404);
        }

        $borrowRecord->returned_at = Carbon::now();
        $borrowRecord->status = 'returned';

        if (Carbon::now()->gt($borrowRecord->due_at)) {
            $daysOverdue = Carbon::now()->diffInDays($borrowRecord->due_at);
            $finePerDay = 1.00;
            $borrowRecord->fine_amount = $daysOverdue * $finePerDay;
        }
        $borrowRecord->save();

        $book = Book::where('book_id', $borrowRecord->book_id)->first();
        if ($book) {
            $book->available_copies = $book->available_copies + 1;
            $book->save();
        }

        return response()->json([
            'message' => 'Book returned successfully',
            'data' => $borrowRecord
        ]);
    }
    public function history()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $borrowRecords = BorrowRecord::with([
            'book.author',
            'book.publisher',
            'book.categories'
        ])
            ->where('user_id', $userId)
            ->orderBy('borrowed_at', 'desc')
            ->get();

        return response()->json($borrowRecords);
    }

    public function getAllBorrows()
    {
        try {
            $user = Auth::user();
            Log::info('User attempting to get all borrow records:', [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role
            ]);
            if ($user->role !== 'admin' && $user->role !== 'librarian') {
                Log::warning('Unauthorized user attempted to access all borrow records', [
                    'user_id' => $user->id,
                    'role' => $user->role
                ]);
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }
            $borrowRecords = BorrowRecord::with([
                'book.author',
                'book.publisher',
                'book.categories',
                'user'
            ])
                ->orderBy('borrowed_at', 'desc')
                ->get();
            Log::info('Retrieved borrow records:', [
                'count' => count($borrowRecords),
                'sample' => $borrowRecords->count() > 0 ? json_encode($borrowRecords->first()) : 'No records'
            ]);

            return response()->json($borrowRecords);
        } catch (\Exception $e) {
            Log::error('Error in getAllBorrows:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve borrow records',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}