<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Enum\ReportStatus;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(security: "is_granted('ROLE_USER')")]
class StatusHistory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(enumType: ReportStatus::class)]
    private ReportStatus $oldStatus;

    #[ORM\Column(enumType: ReportStatus::class)]
    private ReportStatus $newStatus;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $changedAt;

    #[ORM\ManyToOne(targetEntity: Report::class, inversedBy: 'statusHistory')]
    private ?Report $report = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $changedBy = null;

    public function __construct(ReportStatus $oldStatus, ReportStatus $newStatus)
    {
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->changedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOldStatus(): ReportStatus
    {
        return $this->oldStatus;
    }

    public function getNewStatus(): ReportStatus
    {
        return $this->newStatus;
    }

    public function getChangedAt(): \DateTimeImmutable
    {
        return $this->changedAt;
    }

    public function getReport(): ?Report
    {
        return $this->report;
    }

    public function setReport(?Report $report): self
    {
        $this->report = $report;

        return $this;
    }

    public function getChangedBy(): ?User
    {
        return $this->changedBy;
    }

    public function setChangedBy(?User $changedBy): self
    {
        $this->changedBy = $changedBy;

        return $this;
    }
}
