<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Report;
use App\Entity\Category;
use App\Enum\ReportStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\Types\Types;
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

    /**
     * Aggregate reports into approximate geographic clusters using rounded coordinates.
     *
     * @return array<int, array{
     *   lat: float,
     *   lng: float,
     *   weight: int,
     *   category_id: int|null,
     *   category_name: string|null
     * }>
     */
    public function findHeatmapClusters(
        ?int $categoryId = null,
        ?\DateTimeImmutable $dateFrom = null,
        ?\DateTimeImmutable $dateTo = null,
        ?ReportStatus $status = null,
    ): array {
        $sql = <<<'SQL'
            SELECT
                ROUND(r.latitude, 4) AS lat,
                ROUND(r.longitude, 4) AS lng,
                COUNT(*) AS weight,
                c.id AS category_id,
                c.nom AS category_name
            FROM report r
            LEFT JOIN category c ON c.id = r.category_id
            WHERE 1 = 1
        SQL;

        $params = [];
        $types = [];

        if ($categoryId !== null) {
            $sql .= ' AND r.category_id = :categoryId';
            $params['categoryId'] = $categoryId;
        }

        if ($dateFrom !== null) {
            $sql .= ' AND r.created_at >= :dateFrom';
            $params['dateFrom'] = $dateFrom;
            $types['dateFrom'] = Types::DATETIME_IMMUTABLE;
        }

        if ($dateTo !== null) {
            $sql .= ' AND r.created_at <= :dateTo';
            $params['dateTo'] = $dateTo;
            $types['dateTo'] = Types::DATETIME_IMMUTABLE;
        }

        if ($status !== null) {
            $sql .= ' AND r.status = :status';
            $params['status'] = $status->value;
        }

        $sql .= <<<'SQL'
            GROUP BY ROUND(r.latitude, 4), ROUND(r.longitude, 4), c.id, c.nom
            ORDER BY weight DESC, lat ASC, lng ASC
        SQL;

        $rows = $this->getEntityManager()->getConnection()->executeQuery($sql, $params, $types)->fetchAllAssociative();

        return array_map(
            static fn (array $row): array => [
                'lat' => (float) $row['lat'],
                'lng' => (float) $row['lng'],
                'weight' => (int) $row['weight'],
                'category_id' => isset($row['category_id']) ? (int) $row['category_id'] : null,
                'category_name' => $row['category_name'] ?? null,
            ],
            $rows,
        );
    }
}
