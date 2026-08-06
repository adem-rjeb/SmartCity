<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Enum\AssignmentStatus;
use App\State\AssignmentStateProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_AGENT')",
        ),
        new Get(
            security: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_AGENT') and object.getAssignedAgent() == user)",
        ),
        // Only ADMIN/supervisor can create an assignment
        new Post(
            security: "is_granted('ROLE_ADMIN')",
            processor: AssignmentStateProcessor::class,
        ),
        // ADMIN can update anything; AGENT can only update their own assignment
        new Put(
            security: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_AGENT') and object.getAssignedAgent() == user)",
            processor: AssignmentStateProcessor::class,
        ),
        new Patch(
            security: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_AGENT') and object.getAssignedAgent() == user)",
            processor: AssignmentStateProcessor::class,
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
        ),
    ],
    normalizationContext:   ['groups' => ['assignment:read']],
    denormalizationContext: ['groups' => ['assignment:write']],
)]
class Assignment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['assignment:read'])]
    private ?int $id = null;

    #[ORM\Column(enumType: AssignmentStatus::class)]
    #[Assert\NotNull]
    #[Groups(['assignment:read', 'assignment:write'])]
    private AssignmentStatus $status;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['assignment:read', 'assignment:write'])]
    private ?string $commentaire = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['assignment:read'])]
    private \DateTimeImmutable $assignedAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['assignment:read', 'assignment:write'])]
    private ?\DateTimeImmutable $completedAt = null;

    /**
     * OWNING side of the OneToOne — holds the report_id FK.
     * cascade: persist is here (owning side) so Doctrine actually honours it.
     */
    #[ORM\OneToOne(inversedBy: 'assignment', targetEntity: Report::class, cascade: ['persist'])]
    #[ORM\JoinColumn(name: 'report_id', referencedColumnName: 'id', nullable: true, onDelete: 'CASCADE')]
    #[Groups(['assignment:read', 'assignment:write'])]
    private ?Report $report = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'assigned_agent_id', referencedColumnName: 'id', nullable: true)]
    #[Groups(['assignment:read', 'assignment:write'])]
    private ?User $assignedAgent = null;

    /**
     * Set automatically by AssignmentStateProcessor — not writable by clients.
     */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'assigned_by_id', referencedColumnName: 'id', nullable: true)]
    #[Groups(['assignment:read'])]
    private ?User $assignedBy = null;

    public function __construct(AssignmentStatus $status = AssignmentStatus::ASSIGNED)
    {
        $this->status     = $status;
        $this->assignedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStatus(): AssignmentStatus
    {
        return $this->status;
    }

    public function setStatus(AssignmentStatus $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): self
    {
        $this->commentaire = $commentaire;

        return $this;
    }

    public function getAssignedAt(): \DateTimeImmutable
    {
        return $this->assignedAt;
    }

    public function getCompletedAt(): ?\DateTimeImmutable
    {
        return $this->completedAt;
    }

    public function setCompletedAt(?\DateTimeImmutable $completedAt): self
    {
        $this->completedAt = $completedAt;

        return $this;
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

    public function getAssignedAgent(): ?User
    {
        return $this->assignedAgent;
    }

    public function setAssignedAgent(?User $assignedAgent): self
    {
        $this->assignedAgent = $assignedAgent;

        return $this;
    }

    public function getAssignedBy(): ?User
    {
        return $this->assignedBy;
    }

    public function setAssignedBy(?User $assignedBy): self
    {
        $this->assignedBy = $assignedBy;

        return $this;
    }
}
