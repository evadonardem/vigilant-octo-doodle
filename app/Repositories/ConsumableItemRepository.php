<?php

namespace App\Repositories;

use App\Models\ConsumableItem;

class ConsumableItemRepository
{
    public function __construct(
        private ConsumableItem $model
    ) {
    }

    public function delete(int $consumableItemId): bool
    {
        return $this->model->newQuery()->where('id', $consumableItemId)->delete();
    }

    public function getAll()
    {
        return $this->model->newQuery()->orderBy('name', 'desc')->get();
    }

    public function save(array $data): bool
    {
        return $this->model->fill($data)->save();
    }
}
