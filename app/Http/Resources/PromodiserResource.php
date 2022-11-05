<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PromodiserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'contact_no' => $this->contact_no,
            'store_id' => $this->store_id,
            'store' => $this->store,
            'current_job_contract' => $this->currentJobContract,
            'latest_rating' => null,
        ];
    }
}
