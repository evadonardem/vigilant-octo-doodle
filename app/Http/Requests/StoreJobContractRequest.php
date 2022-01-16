<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobContractRequest extends FormRequest
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
            'data.type' => 'in:promodiser-job-contracts',
            'data.attributes.start_date' => 'required|date|before_or_equal:data.attributes.end_date',
            'data.attributes.end_date' => 'required|date',
        ];
    }
}
