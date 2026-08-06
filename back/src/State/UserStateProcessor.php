<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Hashes the plain-text password before persisting a User.
 *
 * On POST  → plainPassword is required (validated via serialization group).
 * On PUT/PATCH → if plainPassword is blank/null, the existing hash is kept untouched.
 *
 * @implements ProcessorInterface<User, User>
 */
final class UserStateProcessor implements ProcessorInterface
{
    public function __construct(
        /** @var ProcessorInterface<User, User> */
        private readonly ProcessorInterface $inner,
        private readonly UserPasswordHasherInterface $hasher,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof User && $data->getPlainPassword() !== null && $data->getPlainPassword() !== '') {
            $data->setPassword(
                $this->hasher->hashPassword($data, $data->getPlainPassword())
            );
            $data->eraseCredentials();
        }

        return $this->inner->process($data, $operation, $uriVariables, $context);
    }
}
