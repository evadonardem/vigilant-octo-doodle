<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\AttendanceLog;

class FakeAttendanceLogsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = User::all();
        $users->each(function ($user) {
            AttendanceLog::factory()
                ->count(100)
                ->create([
                    'biometric_id' => $user->biometric_id,
                    'biometric_name' => $user->name
                ]);
        });
    }
}
