<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\ReportRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class StatsController extends AbstractController
{
    public function __construct(private ReportRepository $reports, private EntityManagerInterface $em)
    {
    }

    #[Route('/api/stats/dashboard', name: 'api_stats_dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        $all = $this->reports->findAll();

        $byStatus = [];
        $byCategory = [];
        $resolvedDurations = [];

        foreach ($all as $r) {
            $status = $r->getStatus()->value;
            $byStatus[$status] = ($byStatus[$status] ?? 0) + 1;

            $cat = $r->getCategory()?->getNom() ?? 'Unknown';
            $byCategory[$cat] = ($byCategory[$cat] ?? 0) + 1;

            if ($r->getResolvedAt() !== null) {
                $resolvedDurations[] = $r->getResolvedAt()->getTimestamp() - $r->getCreatedAt()->getTimestamp();
            }
        }

        $avgDays = 0.0;
        if (count($resolvedDurations) > 0) {
            $avgDays = array_sum($resolvedDurations) / count($resolvedDurations) / 86400.0;
        }

        return new JsonResponse([
            'reportsByStatus' => array_map(fn($k, $v) => ['name' => $k, 'value' => $v], array_keys($byStatus), $byStatus),
            'reportsByCategory' => array_map(fn($k, $v) => ['name' => $k, 'value' => $v], array_keys($byCategory), $byCategory),
            'averageResolutionTimeDays' => $avgDays,
        ]);
    }

    #[Route('/api/stats/resolution-time', name: 'api_stats_resolution', methods: ['GET'])]
    public function resolution(): JsonResponse
    {
        $qb = $this->em->createQueryBuilder();
        $qb->select('r')->from('App\\Entity\\Report', 'r')->where('r.resolvedAt IS NOT NULL');
        $resolved = $qb->getQuery()->getResult();

        $durations = [];
        foreach ($resolved as $r) {
            $durations[] = $r->getResolvedAt()->getTimestamp() - $r->getCreatedAt()->getTimestamp();
        }

        $avg = 0.0;
        if (count($durations) > 0) {
            $avg = array_sum($durations) / count($durations) / 86400.0;
        }

        return new JsonResponse(['averageResolutionTimeDays' => $avg]);
    }
}
