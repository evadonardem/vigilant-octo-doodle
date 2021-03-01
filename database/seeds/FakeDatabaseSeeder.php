<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\User;
use App\Models\AttendanceLog;

class FakeDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call(FakeUsersTableSeeder::class);
        $this->call(FakeAttendanceLogsTableSeeder::class);
    }
}
