<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaterialModel;

class MaterialController extends Controller
{

    public function store(Request $request)
    {

        $validatedData = $request->validate([
            'material_name' => 'required|string|max:255',
            'description' => 'nullable|string',

        ]);
        try {
            $material = MaterialModel::create($validatedData);

            return response()->json([
                'status' => 'success',
                'data' => $material,
                'message' => 'Material created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create material: ' . $e->getMessage()
            ], 500);
        }
    }
}
