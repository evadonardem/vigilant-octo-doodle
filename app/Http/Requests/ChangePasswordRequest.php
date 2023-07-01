<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(Request $request)
    {
        return [
            'old_password' => 'required|string|min:6|max:6|current_password:api',
            'new_password' => 'required|string|min:6|max:6|different:old_password',
            'confirm_new_password' => 'required|string|min:6|max:6|same:new_password',
        ];
    }

    public function messages()
    {
        return [
            'old_password.current_password' => 'Old password didn\'t match.',
        ];
    }
}
