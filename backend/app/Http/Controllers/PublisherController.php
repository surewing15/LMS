<?php

namespace App\Http\Controllers;

use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PublisherController extends Controller
{

    public function index()
    {
        $publishers = Publisher::all();
        return response()->json($publishers);
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'contact_info' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $publisher = new Publisher();
        $publisher->name = $request->name;
        $publisher->address = $request->address;
        $publisher->contact_info = $request->contact_info;
        $publisher->created_at = now();
        $publisher->save();

        return response()->json($publisher, 201);
    }
    public function show($id)
    {
        $publisher = Publisher::findOrFail($id);
        return response()->json($publisher);
    }

    public function update(Request $request, $id)
    {
        $publisher = Publisher::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'contact_info' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $publisher->name = $request->name;
        $publisher->address = $request->address;
        $publisher->contact_info = $request->contact_info;
        $publisher->save();

        return response()->json($publisher);
    }

    public function destroy($id)
    {
        $publisher = Publisher::findOrFail($id);
        $publisher->delete();

        return response()->json(null, 204);
    }
}
