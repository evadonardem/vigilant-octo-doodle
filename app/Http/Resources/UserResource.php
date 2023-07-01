<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'id' => (int)$this->id,
            'biometric_id' => (string)$this->biometric_id,
            'name' => (string)$this->name,
            $this->mergeWhen(
                $request->user()->hasRole('Super Admin') && $request->input('include.roles_and_permissions'),
                [
                    'roles' => $request->input('roles'),
                ]
            ),
        ];
    }
}
