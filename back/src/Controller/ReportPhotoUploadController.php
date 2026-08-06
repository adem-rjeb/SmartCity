<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Report;
use App\Entity\ReportPhoto;
use App\Enum\PhotoType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class ReportPhotoUploadController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    #[Route('/api/reports/{id}/photos', name: 'api_reports_upload_photo', methods: ['POST'], requirements: ['id' => '\\d+'])]
    #[IsGranted('ROLE_USER')]
    public function __invoke(Request $request, int $id): JsonResponse
    {
        $report = $this->em->getRepository(Report::class)->find($id);
        if (! $report) {
            return new JsonResponse(['error' => 'Report not found'], Response::HTTP_NOT_FOUND);
        }

        $file = $request->files->get('photo');
        if (! $file) {
            return new JsonResponse(['error' => 'No photo uploaded'], Response::HTTP_BAD_REQUEST);
        }

        $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads/reports/' . $report->getId();
        if (! is_dir($uploadsDir) && ! mkdir($uploadsDir, 0775, true) && ! is_dir($uploadsDir)) {
            return new JsonResponse(['error' => 'Unable to create upload dir'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $originalName);
        $newName = $safeName . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

        try {
            $file->move($uploadsDir, $newName);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'Unable to save file'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $url = '/uploads/reports/' . $report->getId() . '/' . $newName;

        $photo = new ReportPhoto($url, PhotoType::OTHER);
        $photo->setReport($report);
        $this->em->persist($photo);
        $this->em->flush();

        return new JsonResponse(['id' => $photo->getId(), 'url' => $url], Response::HTTP_CREATED);
    }
}
