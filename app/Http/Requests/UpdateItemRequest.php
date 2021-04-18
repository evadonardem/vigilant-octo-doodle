<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;

class UpdateItemRequest extends FormRequest
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
        $attributes = $request->all();

        $rules = [];
        if (array_key_exists('code', $attributes)) {
            $rules['code'] = 'required|string|max:255|unique:items,code';
        }
        if (array_key_exists('name', $attributes)) {
            $rules['name'] = 'required|string|max:255';
        }

        return $rules;
    }
}
