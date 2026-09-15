<?php

declare(strict_types=1);

namespace App\Controller;

use App\Enum\ReportStatus;
use App\Repository\CategoryRepository;
use App\Repository\ReportRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/analytics')]
final class AnalyticsController extends AbstractController
{
    public function __construct(
        private readonly ReportRepository $reports,
        private readonly CategoryRepository $categories,
    ) {
    }

    #[Route('/heatmap', name: 'api_analytics_heatmap', methods: ['GET'])]
    #[IsGranted('ROLE_SUPER_ADMIN')]
    public function heatmap(Request $request): JsonResponse
    {
        $categoryId = $this->parseCategoryId($request->query->get('category_id'));
        if ($categoryId === false) {
            return new JsonResponse(['error' => 'category_id must be a positive integer'], Response::HTTP_BAD_REQUEST);
        }

        if ($categoryId !== null && $this->categories->find($categoryId) === null) {
            return new JsonResponse(['error' => 'Category not found'], Response::HTTP_BAD_REQUEST);
        }

        $dateFrom = $this->parseDateParam($request->query->get('date_from'), false);
        if ($request->query->has('date_from') && $dateFrom === null) {
            return new JsonResponse(['error' => 'date_from must be a valid date or datetime'], Response::HTTP_BAD_REQUEST);
        }

        $dateTo = $this->parseDateParam($request->query->get('date_to'), true);
        if ($request->query->has('date_to') && $dateTo === null) {
            return new JsonResponse(['error' => 'date_to must be a valid date or datetime'], Response::HTTP_BAD_REQUEST);
        }

        if ($dateFrom !== null && $dateTo !== null && $dateFrom > $dateTo) {
            return new JsonResponse(['error' => 'date_from cannot be later than date_to'], Response::HTTP_BAD_REQUEST);
        }

        $status = null;
        $statusValue = trim((string) $request->query->get('statut', ''));
        if ($statusValue !== '') {
            try {
                $status = ReportStatus::from($statusValue);
            } catch (\ValueError) {
                return new JsonResponse(['error' => 'Invalid statut value'], Response::HTTP_BAD_REQUEST);
            }
        }

        return new JsonResponse(
            $this->reports->findHeatmapClusters(
                $categoryId,
                $dateFrom,
                $dateTo,
                $status,
            ),
        );
    }

    private function parseCategoryId(mixed $value): int|false|null
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_scalar($value) || !ctype_digit((string) $value)) {
            return false;
        }

        $id = (int) $value;

        return $id > 0 ? $id : false;
    }

    private function parseDateParam(mixed $value, bool $endOfDay): ?\DateTimeImmutable
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_scalar($value)) {
            return null;
        }

        $raw = trim((string) $value);
        $dateOnly = \DateTimeImmutable::createFromFormat('Y-m-d', $raw);
        if ($dateOnly instanceof \DateTimeImmutable) {
            return $endOfDay ? $dateOnly->setTime(23, 59, 59) : $dateOnly->setTime(0, 0, 0);
        }

        try {
            return new \DateTimeImmutable($raw);
        } catch (\Exception) {
            return null;
        }
    }
}
