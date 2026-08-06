<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Enum\UserRole;
use App\State\UserStateProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[UniqueEntity(fields: ['email'])]
#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),
        new Get(security: "is_granted('ROLE_ADMIN')"),
        new Post(
            security: "is_granted('ROLE_ADMIN')",
            processor: UserStateProcessor::class,
            validationContext: ['groups' => ['user:create']],
        ),
        new Put(
            security: "is_granted('ROLE_ADMIN')",
            processor: UserStateProcessor::class,
        ),
        new Patch(
            security: "is_granted('ROLE_ADMIN')",
            processor: UserStateProcessor::class,
        ),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext:   ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['role' => 'exact'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['user:read', 'municipality:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 180)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 180)]
    #[Groups(['user:read', 'user:write', 'municipality:read'])]
    private string $nom = '';

    #[ORM\Column(type: 'string', length: 180, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Groups(['user:read', 'user:write', 'municipality:read'])]
    private string $email = '';

    /** Hashed password — never exposed in API responses */
    #[ORM\Column(type: 'string')]
    #[Ignore]
    private string $password = '';

    /**
     * Plain-text password sent from the client.
     * Write-only: required on creation, optional on updates.
     * Hashed by UserStateProcessor before persist.
     */
    #[Assert\NotBlank(groups: ['user:create'], message: 'Password is required when creating a user.')]
    #[Assert\Length(min: 8, groups: ['user:create', 'user:write'])]
    #[Groups(['user:write'])]
    private ?string $plainPassword = null;

    /**
     * Stored as a native PHP enum (Doctrine 3+ enumType).
     */
    #[ORM\Column(enumType: UserRole::class)]
    #[Assert\NotNull]
    #[Groups(['user:read', 'user:write', 'municipality:read'])]
    private UserRole $role = UserRole::CITIZEN;

    #[ORM\ManyToOne(targetEntity: Municipality::class, inversedBy: 'users')]
    #[Groups(['user:read', 'user:write'])]
    private ?Municipality $municipality = null;

    // Explicit no-arg constructor so the serializer always creates an empty instance
    // before calling setters (avoids MissingConstructorArgumentsException).
    public function __construct(
        string $nom = '',
        string $email = '',
        string $password = '',
        UserRole $role = UserRole::CITIZEN,
    ) {
        $this->nom = $nom;
        $this->email = $email;
        $this->password = $password;
        $this->role = $role;
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

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     */
    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    /**
     * Returns roles granted to the user.
     * The enum value already contains the ROLE_ prefix.
     * Always includes ROLE_USER.
     */
    public function getRoles(): array
    {
        $roles = [$this->role->value];
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRole(UserRole $role): self
    {
        $this->role = $role;

        return $this;
    }

    public function getRole(): UserRole
    {
        return $this->role;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    #[Ignore]
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    public function eraseCredentials(): void
    {
        $this->plainPassword = null;
    }

    public function getSalt(): ?string
    {
        return null;
    }

    public function getMunicipality(): ?Municipality
    {
        return $this->municipality;
    }

    public function setMunicipality(?Municipality $municipality): self
    {
        $this->municipality = $municipality;

        return $this;
    }
}
