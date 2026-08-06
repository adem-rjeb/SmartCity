<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/categories')]
class CategoryController extends AbstractController
{
    public function __construct(
        private readonly CategoryRepository $categories,
    ) {
    }

    #[Route('', name: 'api_categories_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(): JsonResponse
    {
        $items = array_map(
            static fn (Category $category) => [
                'id' => $category->getId(),
                'nom' => $category->getNom(),
                'description' => $category->getDescription(),
                'icon' => $category->getIcon(),
                'prioriteParDefaut' => $category->getPrioriteParDefaut()->value,
            ],
            $this->categories->findBy([], ['nom' => 'ASC']),
        );

        return new JsonResponse($items);
    }
}
