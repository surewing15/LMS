<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Publisher extends Model
{
    protected $table = 'tbl_publishers';
    protected $primaryKey = 'publisher_id';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'address',
        'contact_info',
        'created_at'
    ];
}
