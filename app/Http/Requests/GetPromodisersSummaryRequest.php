<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetPromodisersSummaryRequest extends FormRequest
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
    public function rules()
    {
        return [
            'filters.instance_type' => 'sometimes|string',
            'filters.instance_id' => 'sometimes|integer',
            'filters.payment_type' => 'sometimes|string',
            'filters.payment_year_month' => 'sometimes|date',
        ];
    }
}
