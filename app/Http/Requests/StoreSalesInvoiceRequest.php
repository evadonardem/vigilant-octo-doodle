<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesInvoiceRequest extends FormRequest
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
            'date_countered' => 'required|date',
            'booklet_no' => 'required|string|max:255',
            'invoice_no' => 'required|string|max:255',
            'store_id' => 'required|integer',
            'from' => 'required|date',
            'to' => 'required|date',
            'total_sales' => 'required|numeric',
            'vat_rate' => 'required|numeric',
        ];
    }
}
