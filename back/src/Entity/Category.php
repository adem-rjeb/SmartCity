<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Enum\ReportPriority;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ]
)]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    private string $nom;

    #[ORM\Column(type: 'string', length: 1024, nullable: true)]
    #[Assert\Length(max: 1024)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $icon = null;

    #[ORM\Column(enumType: ReportPriority::class)]
    private ReportPriority $prioriteParDefaut;

    #[ORM\OneToMany(mappedBy: 'category', targetEntity: Report::class)]
    private Collection $reports;

    public function __construct(string $nom = '', ReportPriority $prioriteParDefaut = ReportPriority::MEDIUM)
    {
        $this->nom = $nom;
        $this->prioriteParDefaut = $prioriteParDefaut;
        $this->reports = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function setIcon(?string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function getPrioriteParDefaut(): ReportPriority
    {
        return $this->prioriteParDefaut;
    }

    public function setPrioriteParDefaut(ReportPriority $prioriteParDefaut): self
    {
        $this->prioriteParDefaut = $prioriteParDefaut;

        return $this;
    }

    /** @return Collection|Report[] */
    public function getReports(): Collection
    {
        return $this->reports;
    }
}
