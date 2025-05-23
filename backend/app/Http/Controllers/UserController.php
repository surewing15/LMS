<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at', 'updated_at')
            ->where('role', 'student') // Filter only students
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $this->getUserStatus($user), // You can add logic to determine status
                    'joined' => $user->created_at->format('Y-m-d'),
                    'lastActive' => $user->updated_at->format('Y-m-d'),
                ];
            });

        return response()->json(['users' => $users]);
    }


    /**
     * Store a newly created user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|string|in:admin,librarian,student',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Update the specified user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $id,
            'role' => 'string|in:admin,librarian,student',
            'status' => 'string|in:active,inactive,pending',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Remove the specified user from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Determine user status based on various factors
     *
     * @param User $user
     * @return string
     */
    private function getUserStatus(User $user): string
    {
        // This is a placeholder - implement your own logic
        // For example, you might check last login date, account verification, etc.

        // Example logic (modify according to your needs):
        if (!$user->email_verified_at) {
            return 'pending';
        }

        // If user hasn't been active in 30 days
        if ($user->updated_at->diffInDays(now()) > 30) {
            return 'inactive';
        }

        return 'active';
    }
}
