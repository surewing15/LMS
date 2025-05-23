<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\BorrowRecord;
use Carbon\Carbon;
use App\Models\User;
class DasboardController extends Controller
{
    public function getStats()
    {
        $totalBooks = Book::count();
        $availableCopies = Book::sum('available_copies');
        $activeLoans = BorrowRecord::whereNull('returned_at')->count();
        $overdueLoans = BorrowRecord::whereNull('returned_at')
            ->where('due_at', '<', Carbon::now())
            ->count();
        $totalStudents = User::where('role', 'student')->count();
        $recentLoans = BorrowRecord::with(['book', 'user'])
            ->orderBy('borrowed_at', 'desc')
            ->take(5)
            ->get();
        $formattedRecentLoans = $recentLoans->map(function ($loan) {
            return [
                'id' => $loan->id,
                'bookId' => $loan->book_id,
                'bookTitle' => $loan->book->title ?? 'Unknown',
                'userId' => $loan->user_id,
                'userName' => $loan->user->name ?? 'Unknown',
                'borrowedAt' => $loan->borrowed_at,
                'dueAt' => $loan->due_at,
                'returnedAt' => $loan->returned_at,
                'status' => $loan->returned_at ? 'returned' :
                    (Carbon::now()->gt(Carbon::parse($loan->due_at)) ? 'overdue' : 'borrowed'),
            ];
        });
        return response()->json([
            'totalBooks' => $totalBooks,
            'availableCopies' => $availableCopies,
            'activeLoans' => $activeLoans,
            'overdueLoans' => $overdueLoans,
            'totalStudents' => $totalStudents,
            'recentLoans' => $formattedRecentLoans,
        ]);
    }
}