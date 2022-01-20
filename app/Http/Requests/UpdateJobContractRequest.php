<?php

namespace App\Http\Requests;

use App\Models\JobContract;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobContractRequest extends FormRequest
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
        $jobContract = request()->job_contract;

        return [
            'data.id' => 'required|integer|min:1',
            'data.attributes.end_date' => [
                'sometimes',
                'required',
                'date',
                function ($attribute, $value, $fail) use ($jobContract) {
                    $isValidEndDate = Carbon::parse($value)->gte($jobContract->start_date);                
                    if (!$isValidEndDate) {
                        $fail('The end date must be greater than or equal to start date.');
                    }
                },
            ],
            'data.attributes.rate' => 'sometimes|required|numeric|min:0',
        ];
    }
}
