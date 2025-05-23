<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class FinePayment extends Model
{
    protected $fillable = [
        'borrow_record_id',
        'amount',
        'paid_at',
    ];
    protected $dates = ['paid_at'];
    public function borrowRecord(): BelongsTo
    {
        return $this->belongsTo(BorrowRecord::class);
    }
}
