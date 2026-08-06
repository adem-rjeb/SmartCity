<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Report;
use App\Entity\User;
use App\Repository\ReportRepository;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;

class ReportCreateAction extends AbstractController
{
    private EntityManagerInterface $em;
    private ReportRepository $reports;
    private CategoryRepository $categories;

    public function __construct(EntityManagerInterface $em, ReportRepository $reports, CategoryRepository $categories)
    {
        $this->em = $em;
        $this->reports = $reports;
        $this->categories = $categories;
    }

    public function __invoke(Request $request): JsonResponse
    {
        // Support both JSON bodies and multipart/form-data (file uploads)
        $content = $request->getContent();
        if (! $content && $request->request->count() > 0) {
            // multipart/form-data: read from request parameters
            $data = $request->request->all();
        } else {
            $data = json_decode($content ?? '{}', true);
        }

        $titre = $data['titre'] ?? null;
        $description = $data['description'] ?? null;
        $adresse = $data['adresse'] ?? null;
        $latitude = isset($data['latitude']) ? (float)$data['latitude'] : null;
        $longitude = isset($data['longitude']) ? (float)$data['longitude'] : null;
        $categoryId = $data['category'] ?? null;

        if (! $titre || ! $description || $latitude === null || $longitude === null || ! $categoryId) {
            return new JsonResponse(['error' => 'Missing fields'], Response::HTTP_BAD_REQUEST);
        }

        $category = $this->categories->find($categoryId);
        if (! $category) {
            return new JsonResponse(['error' => 'Category not found'], Response::HTTP_BAD_REQUEST);
        }

        // Check for duplicates within 50 meters (0.05 km)
        $duplicates = $this->reports->findNearbyDuplicates($latitude, $longitude, $category, 0.05);

        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }

        $report = new Report($titre, $description, $adresse, $latitude, $longitude, $reportStatus = \App\Enum\ReportStatus::PENDING, $category->getPrioriteParDefaut());
        $report->setCategory($category);
        $report->setCreator($user);

        $this->em->persist($report);
        $this->em->flush();

        // If a photo was uploaded via multipart, handle saving it and create ReportPhoto
        $uploaded = $request->files->get('photo');
        if ($uploaded) {
            $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads/reports/' . $report->getId();
            if (! is_dir($uploadsDir)) {
                @mkdir($uploadsDir, 0775, true);
            }

            $originalName = pathinfo($uploaded->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $originalName);
            $newName = $safeName . '_' . uniqid() . '.' . $uploaded->getClientOriginalExtension();
            try {
                $uploaded->move($uploadsDir, $newName);
                $url = '/uploads/reports/' . $report->getId() . '/' . $newName;
                $photo = new \App\Entity\ReportPhoto($url, \App\Enum\PhotoType::BEFORE);
                $photo->setReport($report);
                $this->em->persist($photo);
                $this->em->flush();
            } catch (\Throwable $e) {
                // ignore photo save errors but include warning later if needed
            }
        }

        $payload = ['id' => $report->getId()];
        if (count($duplicates) > 0) {
            $payload['warning'] = 'Similar reports found nearby';
            $payload['duplicates'] = array_map(fn($r) => ['id' => $r->getId(), 'titre' => $r->getTitre()], $duplicates);
        }

        return new JsonResponse($payload, Response::HTTP_CREATED);
    }
}
