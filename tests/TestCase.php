<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Hash;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    public function authenticate(User $user) {
        $user->password = Hash::make('123456');
        $user->save();

        $response = $this->post('/api/login', [
            'biometric_id' => $user->biometric_id,
            'password' => '123456',
        ]);

        if ($response->getStatusCode() == 200) {
            return $response->decodeResponseJson()['token'];
        }

        return null;
    }
}
