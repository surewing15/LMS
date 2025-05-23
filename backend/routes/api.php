<?php
// routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PublisherController;
use App\Http\Controllers\AuthorsController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowController;
use App\Http\Controllers\DasboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Add your other protected routes here
});

// Test route
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!'
    ]);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
});

Route::middleware('auth:sanctum')->group(function () {
    // Dashboard Routes
    Route::get('/dashboard/stats', [DasboardController::class, 'getStats']);
    // Category Routes
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    // Publisher Routes
    Route::get('/publishers', [PublisherController::class, 'index']);
    Route::post('/publishers', [PublisherController::class, 'store']);
    Route::get('/publishers/{id}', [PublisherController::class, 'show']);
    Route::put('/publishers/{id}', [PublisherController::class, 'update']);
    Route::delete('/publishers/{id}', [PublisherController::class, 'destroy']);
    // Author Routes
    Route::get('/authors', [AuthorsController::class, 'index']);
    Route::post('/authors', [AuthorsController::class, 'store']);
    Route::get('/authors/{id}', [AuthorsController::class, 'show']);
    Route::put('/authors/{id}', [AuthorsController::class, 'update']);
    Route::delete('/authors/{id}', [AuthorsController::class, 'destroy']);
    // Book Routes
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/form-data', [BookController::class, 'getFormData']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    Route::put('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);

    // Borrow Record Routes
    Route::get('/borrow-records', [BorrowController::class, 'index']);
    Route::post('/borrow-records', [BorrowController::class, 'store']);
    Route::get('/borrow-records/{id}', [BorrowController::class, 'show']);
    Route::post('/borrow-records/{id}/return', [BorrowController::class, 'returnBook']);
    Route::get('/borrow-history', [BorrowController::class, 'history']);
    Route::get('/all-borrow-records', [BorrowController::class, 'getAllBorrows']);
    Route::get('/borrow-records/{id}/return', [BorrowController::class, 'returnBook']);
});
