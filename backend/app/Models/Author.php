<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Author extends Model
{

    protected $table = 'tbl_authors';
    protected $primaryKey = 'author_id';
    public $timestamps = false;
    protected $fillable = [
        'name',
        'bio',
        'nationality',
        'birth_date',

    ];
}
