<?php

namespace App\Http\Requests;

use Illuminate\Http\Request;
use Illuminate\Foundation\Http\FormRequest;

class GetAbsencesReportRequest extends FormRequest
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
          'start_date' => 'required|date|before_or_equal:end_date',
          'end_date' => 'required|date|before:now'
        ];

        $type = $request->input('type');

        if ($type == 'individual') {
            $rules['biometric_id'] = 'required';
        }

        return $rules;
    }
}
