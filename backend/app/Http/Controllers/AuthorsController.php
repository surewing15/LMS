<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthorsController extends Controller
{

    public function index()
    {
        $authors = Author::all();

        foreach ($authors as $author) {
            $author->book_count = $author->books()->count();
        }

        return response()->json($authors);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'nationality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $author = new Author();
        $author->name = $request->name;
        $author->bio = $request->bio;
        $author->nationality = $request->nationality;
        $author->birth_date = $request->birth_date;
        $author->created_at = now();
        $author->save();

        return response()->json($author, 201);
    }

    public function show($id)
    {
        $author = Author::findOrFail($id);
        $author->book_count = $author->books()->count();

        return response()->json($author);
    }


    public function update(Request $request, $id)
    {
        $author = Author::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'nationality' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $author->name = $request->name;
        $author->bio = $request->bio;
        $author->nationality = $request->nationality;
        $author->birth_date = $request->birth_date;
        $author->save();

        return response()->json($author);
    }


    public function destroy($id)
    {
        $author = Author::findOrFail($id);
        $author->delete();

        return response()->json(null, 204);
    }
}
