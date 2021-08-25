<?php

namespace App\Http\Requests;

use Illuminate\Http\Request;
use Illuminate\Foundation\Http\FormRequest;

class GetChartDataRequest extends FormRequest
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
        $rules = [
          'from' => 'required|date|before_or_equal:to',
          'to' => 'required|date'
        ];

        if ($request->has('stores')) {
          $rules['stores'] = 'required';
        } elseif ($request->has('categories')) {
          $rules['categories'] = 'required';
        } else {
          if ($request->has('locations')) {
            $rules['locations'] = 'required';
          }
        }

        return $rules;
    }
}
