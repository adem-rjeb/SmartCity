<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource(
    security: "is_granted('ROLE_USER')",
    normalizationContext: ['groups' => ['municipality:read']]
)]
class Municipality
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    #[\Symfony\Component\Serializer\Attribute\Groups(['municipality:read'])]
    private string $nom;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    #[\Symfony\Component\Serializer\Attribute\Groups(['municipality:read'])]
    private string $gouvernorat;

    #[ORM\Column(type: 'string', length: 64)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 64)]
    #[\Symfony\Component\Serializer\Attribute\Groups(['municipality:read'])]
    private string $code;

    #[ORM\OneToMany(mappedBy: 'municipality', targetEntity: User::class)]
    #[\Symfony\Component\Serializer\Attribute\Groups(['municipality:read'])]
    private Collection $users;

    public function __construct(string $nom = '', string $gouvernorat = '', string $code = '')
    {
        $this->nom = $nom;
        $this->gouvernorat = $gouvernorat;
        $this->code = $code;
        $this->users = new ArrayCollection();
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

    public function getGouvernorat(): string
    {
        return $this->gouvernorat;
    }

    public function setGouvernorat(string $gouvernorat): self
    {
        $this->gouvernorat = $gouvernorat;

        return $this;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function setCode(string $code): self
    {
        $this->code = $code;

        return $this;
    }

    /** @return Collection|User[] */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): self
    {
        if (! $this->users->contains($user)) {
            $this->users->add($user);
            $user->setMunicipality($this);
        }

        return $this;
    }

    public function removeUser(User $user): self
    {
        if ($this->users->removeElement($user)) {
            // set the owning side to null (unless already changed)
            if ($user->getMunicipality() === $this) {
                $user->setMunicipality(null);
            }
        }

        return $this;
    }
}
