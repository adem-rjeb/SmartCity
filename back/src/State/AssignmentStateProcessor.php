<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Assignment;
use App\Entity\User;
use App\Enum\AssignmentStatus;
use App\Enum\ReportStatus;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Assignment side-effects:
 *  - On POST: set assignedBy, set Report.status → ASSIGNED
 *  - On PUT/PATCH: sync Report.status from Assignment.status
 *      ACCEPTED / IN_PROGRESS → IN_PROGRESS
 *      COMPLETED             → RESOLVED (+ resolvedAt)
 *      CANCELLED             → PENDING (unlinks assignment)
 *
 * @implements ProcessorInterface<Assignment, Assignment>
 */
final class AssignmentStateProcessor implements ProcessorInterface
{
    public function __construct(
        /** @var ProcessorInterface<Assignment, Assignment> */
        private readonly ProcessorInterface $inner,
        private readonly Security $security,
        private readonly EntityManagerInterface $em,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Assignment) {
            return $this->inner->process($data, $operation, $uriVariables, $context);
        }

        $currentUser = $this->security->getUser();

        if ($operation instanceof Post) {
            if ($currentUser instanceof User && $data->getAssignedBy() === null) {
                $data->setAssignedBy($currentUser);
            }

            $result = $this->inner->process($data, $operation, $uriVariables, $context);

            $report = $data->getReport();
            if ($report !== null) {
                $report->setStatus(ReportStatus::ASSIGNED);
                $report->setAssignment($data);
                $report->setUpdatedAt(new \DateTimeImmutable());
                $this->em->persist($report);
                $this->em->flush();
            }

            return $result;
        }

        if ($operation instanceof Put || $operation instanceof Patch) {
            if ($data->getStatus() === AssignmentStatus::COMPLETED && $data->getCompletedAt() === null) {
                $data->setCompletedAt(new \DateTimeImmutable());
            }

            $result = $this->inner->process($data, $operation, $uriVariables, $context);
            $this->syncReportStatus($data);

            return $result;
        }

        return $this->inner->process($data, $operation, $uriVariables, $context);
    }

    private function syncReportStatus(Assignment $assignment): void
    {
        $report = $assignment->getReport();
        if ($report === null) {
            return;
        }

        $reportStatus = match ($assignment->getStatus()) {
            AssignmentStatus::ACCEPTED, AssignmentStatus::IN_PROGRESS => ReportStatus::IN_PROGRESS,
            AssignmentStatus::COMPLETED => ReportStatus::RESOLVED,
            AssignmentStatus::CANCELLED => ReportStatus::PENDING,
            AssignmentStatus::ASSIGNED => ReportStatus::ASSIGNED,
        };

        $report->setStatus($reportStatus);
        $report->setUpdatedAt(new \DateTimeImmutable());

        if ($reportStatus === ReportStatus::RESOLVED && $report->getResolvedAt() === null) {
            $report->setResolvedAt(new \DateTimeImmutable());
        }

        if ($assignment->getStatus() === AssignmentStatus::CANCELLED) {
            $report->setAssignment(null);
        }

        $this->em->persist($report);
        $this->em->flush();
    }
}
