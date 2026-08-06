<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Report;
use App\Entity\Category;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ReportRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Report::class);
    }

    /**
     * Find nearby reports within $radiusKm kilometers using Haversine formula
     * excluding CLOSED and REJECTED statuses and matching category
     *
     * @return Report[]
     */
    public function findNearbyDuplicates(float $lat, float $lng, Category $category, float $radiusKm = 0.05): array
    {
        $conn = $this->getEntityManager()->getConnection();

        // Haversine formula in SQL
        $sql = "SELECT r.id
                FROM report r
                WHERE r.category_id = :catId
                  AND r.status NOT IN (:closed, :rejected)
                  AND (6371 * 2 * ASIN(SQRT(POWER(SIN((r.latitude - :lat) * PI() / 180 / 2), 2) + COS(:lat * PI() / 180) * COS(r.latitude * PI() / 180) * POWER(SIN((r.longitude - :lng) * PI() / 180 / 2), 2))) ) <= :radius
                ";

        $stmt = $conn->prepare($sql);
        $stmt->bindValue('catId', $category->getId());
        $stmt->bindValue('closed', \App\Enum\ReportStatus::CLOSED->value);
        $stmt->bindValue('rejected', \App\Enum\ReportStatus::REJECTED->value);
        $stmt->bindValue('lat', $lat);
        $stmt->bindValue('lng', $lng);
        $stmt->bindValue('radius', $radiusKm);

        $result = $stmt->executeQuery()->fetchAllAssociative();

        if (! $result) {
            return [];
        }

        $ids = array_map(fn($r) => (int)$r['id'], $result);

        return $this->createQueryBuilder('r')
            ->andWhere('r.id IN (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->getResult();
    }
}
