<?php

namespace App\Services;

use App\Models\ConsumableItem;
use App\Repositories\ConsumableItemRepository;

class ConsumableItemService
{
    public function __construct(
        private ConsumableItemRepository $repository
    ) {
    }

    public function create(array $data): bool
    {
        return $this->repository->save($data);
    }

    public function delete(ConsumableItem $consumableItem): bool
    {
        return $this->repository->delete($consumableItem->id);
    }

    public function getAll()
    {
        return $this->repository->getAll();
    }
}
