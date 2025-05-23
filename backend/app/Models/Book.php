<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $table = 'tbl_books';
    protected $primaryKey = 'book_id';


    protected $fillable = [
        'title',
        'isbn',
        'category_id',
        'author_id',
        'publisher_id',
        'publication_year',
        'edition',
        'total_copies',
        'available_copies',
        'location_in_library',
        'description',
        'cover_image'
    ];


    public function author()
    {
        return $this->belongsTo(Author::class, 'author_id', 'author_id');
    }

    public function publisher()
    {
        return $this->belongsTo(Publisher::class, 'publisher_id', 'publisher_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'tbl_book_categories', 'book_id', 'category_id');
    }


    public function getStatusAttribute()
    {
        if ($this->available_copies <= 0) {
            return 'Unavailable';
        } elseif ($this->available_copies <= 2) {
            return 'Low Stock';
        } else {
            return 'Available';
        }
    }
    public function borrowRecords()
    {

        return $this->hasMany(BorrowRecord::class, 'book_id', 'book_id');
    }

}
