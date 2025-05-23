<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class BorrowRecord extends Model
{
    protected $table = 'tbl_borrow_records';
    protected $fillable = [
        'user_id',
        'book_id',
        'borrowed_at',
        'due_at',
        'returned_at',
        'fine_amount',
        'status',
    ];
    protected $dates = [
        'borrowed_at',
        'due_at',
        'returned_at',
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);

    }
    public function book(): BelongsTo
    {

        return $this->belongsTo(Book::class, 'book_id', 'book_id');
    }
    public function finePayments(): HasMany
    {
        return $this->hasMany(FinePayment::class);
    }
    public function getTotalPaidAttribute(): float
    {
        return $this->finePayments->sum('amount');
    }
    public function getBalanceAttribute(): float
    {
        return (float) $this->fine_amount - $this->total_paid;
    }
}