<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use App\Enum\ReportPriority;
use App\Enum\ReportStatus;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(security: "is_granted('PUBLIC_ACCESS')"),
        new GetCollection(security: "is_granted('PUBLIC_ACCESS')"),
        new Post(controller: \App\Controller\ReportCreateAction::class, security: "is_granted('ROLE_CITIZEN')"),
        new Put(security: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_AGENT') and object.getAssignment() and object.getAssignment().getAssignedAgent() == user)")
    ],
    normalizationContext: ['groups' => ['report:read']],
    security: "is_granted('ROLE_USER')"
)]
class Report
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['report:read', 'assignment:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    #[Groups(['report:read', 'assignment:read'])]
    private string $titre;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    #[Groups(['report:read', 'assignment:read'])]
    private string $description;

    #[ORM\Column(type: 'string', length: 512)]
    #[Assert\NotBlank]
    #[Groups(['report:read', 'assignment:read'])]
    private string $adresse;

    #[ORM\Column(type: 'float')]
    #[Groups(['report:read', 'assignment:read'])]
    private float $latitude;

    #[ORM\Column(type: 'float')]
    #[Groups(['report:read', 'assignment:read'])]
    private float $longitude;

    #[ORM\Column(enumType: ReportStatus::class)]
    #[Groups(['report:read', 'assignment:read'])]
    private ReportStatus $status;

    #[ORM\Column(enumType: ReportPriority::class)]
    #[Groups(['report:read', 'assignment:read'])]
    private ReportPriority $priority;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['report:read', 'assignment:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['report:read', 'assignment:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['report:read', 'assignment:read'])]
    private ?\DateTimeImmutable $resolvedAt = null;

    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'reports')]
    #[Groups(['report:read', 'assignment:read'])]
    private ?Category $category = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[Groups(['report:read', 'assignment:read'])]
    private ?User $creator = null;

    #[ORM\OneToMany(mappedBy: 'report', targetEntity: Comment::class, cascade: ['persist','remove'])]
    private Collection $comments;

    #[ORM\OneToMany(mappedBy: 'report', targetEntity: ReportPhoto::class, cascade: ['persist','remove'])]
    private Collection $photos;

    #[ORM\OneToMany(mappedBy: 'report', targetEntity: StatusHistory::class, cascade: ['persist','remove'])]
    private Collection $statusHistory;

    #[ORM\OneToMany(mappedBy: 'report', targetEntity: Notification::class, cascade: ['persist','remove'])]
    private Collection $notifications;

    #[ORM\OneToOne(mappedBy: 'report', targetEntity: Assignment::class, cascade: ['remove'], orphanRemoval: true)]
    private ?Assignment $assignment = null;

    public function __construct(string $titre, string $description, string $adresse, float $latitude, float $longitude, ReportStatus $status, ReportPriority $priority)
    {
        $this->titre = $titre;
        $this->description = $description;
        $this->adresse = $adresse;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->status = $status;
        $this->priority = $priority;
        $this->createdAt = new \DateTimeImmutable();
        $this->comments = new ArrayCollection();
        $this->photos = new ArrayCollection();
        $this->statusHistory = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitre(): string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): self
    {
        $this->titre = $titre;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getAdresse(): string
    {
        return $this->adresse;
    }

    public function setAdresse(string $adresse): self
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getLatitude(): float
    {
        return $this->latitude;
    }

    public function setLatitude(float $latitude): self
    {
        $this->latitude = $latitude;

        return $this;
    }

    public function getLongitude(): float
    {
        return $this->longitude;
    }

    public function setLongitude(float $longitude): self
    {
        $this->longitude = $longitude;

        return $this;
    }

    public function getStatus(): ReportStatus
    {
        return $this->status;
    }

    public function setStatus(ReportStatus $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getPriority(): ReportPriority
    {
        return $this->priority;
    }

    public function setPriority(ReportPriority $priority): self
    {
        $this->priority = $priority;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getResolvedAt(): ?\DateTimeImmutable
    {
        return $this->resolvedAt;
    }

    public function setResolvedAt(?\DateTimeImmutable $resolvedAt): self
    {
        $this->resolvedAt = $resolvedAt;

        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): self
    {
        $this->category = $category;

        return $this;
    }

    public function getCreator(): ?User
    {
        return $this->creator;
    }

    public function setCreator(?User $creator): self
    {
        $this->creator = $creator;

        return $this;
    }

    /** @return Collection|Comment[] */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comment $comment): self
    {
        if (! $this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setReport($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): self
    {
        if ($this->comments->removeElement($comment)) {
            if ($comment->getReport() === $this) {
                $comment->setReport(null);
            }
        }

        return $this;
    }

    /** @return Collection|ReportPhoto[] */
    public function getPhotos(): Collection
    {
        return $this->photos;
    }

    public function getAssignment(): ?Assignment
    {
        return $this->assignment;
    }

    public function setAssignment(?Assignment $assignment): self
    {
        $this->assignment = $assignment;

        return $this;
    }

    /** @return Collection|StatusHistory[] */
    public function getStatusHistory(): Collection
    {
        return $this->statusHistory;
    }

    /** @return Collection|Notification[] */
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }
}
