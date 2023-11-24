<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeliveryReceiptPaymentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'payment_date' => 'required|date',
            'amount' => 'required|numeric',
            'remarks' => 'required',
        ];
    }
}
