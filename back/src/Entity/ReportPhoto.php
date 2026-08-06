<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Enum\PhotoType;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(security: "is_granted('ROLE_USER')")]
class ReportPhoto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 1024)]
    #[Assert\NotBlank]
    private string $url;

    #[ORM\Column(enumType: PhotoType::class)]
    private PhotoType $type;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $uploadedAt;

    #[ORM\ManyToOne(targetEntity: Report::class, inversedBy: 'photos')]
    private ?Report $report = null;

    public function __construct(string $url = '', PhotoType $type = PhotoType::BEFORE)
    {
        $this->url = $url;
        $this->type = $type;
        $this->uploadedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): self
    {
        $this->url = $url;

        return $this;
    }

    public function getType(): PhotoType
    {
        return $this->type;
    }

    public function setType(PhotoType $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getUploadedAt(): \DateTimeImmutable
    {
        return $this->uploadedAt;
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
}
