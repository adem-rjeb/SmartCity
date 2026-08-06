<?php

declare(strict_types=1);

namespace App\Security\Voter;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Grants full manage rights to ADMIN and SUPER_ADMIN roles for Users, Categories and AuditLog.
 */
class UniversalAdminVoter extends Voter
{
    public const MANAGE = 'manage';

    protected function supports(string $attribute, $subject): bool
    {
        return $attribute === self::MANAGE;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?\Symfony\Component\Security\Core\Authorization\Voter\Vote $vote = null): bool
    {
        $user = $token->getUser();

        if (! $user instanceof UserInterface) {
            return false;
        }

        $roles = $user->getRoles();

        return in_array('ROLE_ADMIN', $roles, true) || in_array('ROLE_SUPER_ADMIN', $roles, true);
    }
}
