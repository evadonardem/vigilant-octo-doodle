<?php

namespace App\Http\Requests;

use App\Models\JobContract;
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
        $promodiser = request()->promodiser;
        $endDate = request()->input('data.attributes.end_date');
        $isToPresent = request()->input('data.attributes.to_present');

        $startDateRules = [
            'required',
            'date',            
            function ($attribute, $value, $fail) use ($promodiser) {
                $isExistJobContract = JobContract::where('promodiser_id', '=', $promodiser->id)
                    ->where(function ($query) use ($value) {
                        $query
                            ->where(function ($query) use ($value) {
                                $query
                                    ->where('start_date', '<=', $value)
                                    ->where('end_date', '>=', $value);
                            });                            
                    })                    
                    ->get()
                    ->isNotEmpty();
                if ($isExistJobContract) {
                    $fail('The ' . $attribute . ' was overlapping with existing contract.');
                }
            },
        ];

        $endDateRules = [
            'required',
            'date',
            function ($attribute, $value, $fail) use ($promodiser) {
                $isExistJobContract = JobContract::where('promodiser_id', '=', $promodiser->id)
                    ->where(function ($query) use ($value) {
                        $query
                            ->where(function ($query) use ($value) {
                                $query
                                    ->where('start_date', '<=', $value)
                                    ->where('end_date', '>=', $value);
                            })
                            ->whereNotNull('end_date');
                    })
                    ->orWhere(function ($query) use ($value) {
                        $query
                            ->where(function ($query) use ($value) {
                                $query
                                    ->where('start_date', '<=', $value);                                    
                            })
                            ->whereNull('end_date');
                    })
                    ->get()
                    ->isNotEmpty();
                if ($isExistJobContract) {
                    $fail('The ' . $attribute . ' was overlapping with existing contract.');
                }
            },
        ];

        $rules = [];
        if (!$isToPresent) {
            $startDateRules[] = 'before_or_equal:data.attributes.end_date';
            $rules['data.attributes.end_date'] = $endDateRules;
        } else {
            $startDateRules[] = function ($attribute, $value, $fail) use ($promodiser, $endDate) {
                if (!$endDate) {                    
                    $isExistJobContract = JobContract::where('promodiser_id', '=', $promodiser->id)
                        ->where(function ($query) use ($value) {
                            $query
                                ->where(function ($query) use ($value) {
                                    $query
                                        ->where('start_date', '<=', $value)
                                        ->where('end_date', '>=', $value);
                                })
                                ->whereNotNull('end_date');
                        })
                        ->orWhere(function ($query) use ($value) {
                            $query
                                ->where(function ($query) use ($value) {
                                    $query
                                        ->where('start_date', '>=', $value);                                    
                                })
                                ->whereNotNull('end_date');
                        })
                        ->get()
                        ->isNotEmpty();
                    $isExistActiveJobContract = JobContract::where('promodiser_id', '=', $promodiser->id)
                        ->whereNull('end_date')
                        ->get()
                        ->isNotEmpty();
                    if ($isExistJobContract) {
                        $fail('The ' . $attribute . ' was overlapping with existing contract.');
                    }
                    if ($isExistActiveJobContract) {
                        $fail('Only one active job contract allowed.');
                    }
                }
            };
        }
        $rules['data.attributes.start_date'] = $startDateRules;
        
        return $rules;
    }
}
