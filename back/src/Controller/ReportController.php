<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Report;
use App\Enum\ReportStatus;
use App\Repository\CategoryRepository;
use App\Repository\ReportRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/reports')]
class ReportController extends AbstractController
{
    public function __construct(
        private readonly ReportRepository $reports,
        private readonly CategoryRepository $categories,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_reports_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $items = array_map(fn (Report $report) => $this->serializeReport($report), $this->reports->findBy([], ['createdAt' => 'DESC']));

        return new JsonResponse($items);
    }

    #[Route('/{id}', name: 'api_reports_get', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function get(int $id): JsonResponse
    {
        $report = $this->reports->find($id);
        if (!$report) {
            return new JsonResponse(['error' => 'Report not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($this->serializeReport($report));
    }

    #[Route('/{id}', name: 'api_reports_patch', methods: ['PATCH'], requirements: ['id' => '\\d+'])]
    public function patch(int $id, Request $request): JsonResponse
    {
        $report = $this->reports->find($id);
        if (!$report) {
            return new JsonResponse(['error' => 'Report not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent() ?: '{}', true);
        if (isset($data['status'])) {
            try {
                $report->setStatus(ReportStatus::from((string) $data['status']));
            } catch (\ValueError $e) {
                return new JsonResponse(['error' => 'Invalid status'], Response::HTTP_BAD_REQUEST);
            }
        }

        if (isset($data['priority'])) {
            try {
                $report->setPriority(\App\Enum\ReportPriority::from((string) $data['priority']));
            } catch (\ValueError $e) {
                return new JsonResponse(['error' => 'Invalid priority'], Response::HTTP_BAD_REQUEST);
            }
        }

        $report->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return new JsonResponse($this->serializeReport($report));
    }

    #[Route('', name: 'api_reports_create', methods: ['POST'])]
    #[IsGranted('ROLE_CITIZEN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent() ?: '{}', true);
        if (!is_array($data)) {
            return new JsonResponse(['error' => 'Invalid JSON body'], Response::HTTP_BAD_REQUEST);
        }

        $titre = $data['titre'] ?? null;
        $description = $data['description'] ?? null;
        $adresse = $data['adresse'] ?? '';
        $latitude = isset($data['latitude']) ? (float) $data['latitude'] : null;
        $longitude = isset($data['longitude']) ? (float) $data['longitude'] : null;
        $categoryId = $data['category'] ?? null;

        if (!$titre || !$description || $latitude === null || $longitude === null || !$categoryId) {
            return new JsonResponse(['error' => 'Missing fields'], Response::HTTP_BAD_REQUEST);
        }

        $category = $this->categories->find($categoryId);
        if (!$category) {
            return new JsonResponse(['error' => 'Category not found'], Response::HTTP_BAD_REQUEST);
        }

        $duplicates = $this->reports->findNearbyDuplicates($latitude, $longitude, $category, 0.05);

        $report = new Report(
            $titre,
            $description,
            (string) $adresse,
            $latitude,
            $longitude,
            ReportStatus::PENDING,
            $category->getPrioriteParDefaut(),
        );
        $report->setCategory($category);
        $report->setCreator($this->getUser());

        $this->em->persist($report);
        $this->em->flush();

        $payload = $this->serializeReport($report);
        if (count($duplicates) > 0) {
            $payload['warning'] = 'Similar reports found nearby';
            $payload['duplicates'] = array_map(
                static fn (Report $duplicate) => ['id' => $duplicate->getId(), 'titre' => $duplicate->getTitre()],
                $duplicates,
            );
        }

        return new JsonResponse($payload, Response::HTTP_CREATED);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeReport(Report $report): array
    {
        $category = $report->getCategory();
        $creator = $report->getCreator();

        return [
            'id' => $report->getId(),
            'titre' => $report->getTitre(),
            'description' => $report->getDescription(),
            'adresse' => $report->getAdresse(),
            'latitude' => $report->getLatitude(),
            'longitude' => $report->getLongitude(),
            'status' => $report->getStatus()->value,
            'priority' => $report->getPriority()->value,
            'createdAt' => $report->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $report->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
            'resolvedAt' => $report->getResolvedAt()?->format(\DateTimeInterface::ATOM),
            'category' => $category ? [
                'id' => $category->getId(),
                'nom' => $category->getNom(),
                'description' => $category->getDescription(),
                'prioriteParDefaut' => $category->getPrioriteParDefaut()->value,
            ] : null,
            'creator' => $creator ? [
                'id' => $creator->getId(),
                'nom' => $creator->getNom(),
                'email' => $creator->getEmail(),
                'role' => $creator->getRole()->value,
            ] : null,
        ];
    }
}
