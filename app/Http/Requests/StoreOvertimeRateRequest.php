<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StoreOvertimeRateRequest extends FormRequest
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
            'effectivity_date' => 'required|date',
            'overtime_rate_type_id' => 'required|integer',
            'non_night_shift' => 'required|numeric',
            'night_shift' => 'required|numeric',
        ];
    }
}
