<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\Report;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class ReportVoter extends Voter
{
    public const VIEW = 'view';
    public const CREATE = 'create';
    public const EDIT = 'edit';
    public const ASSIGN = 'assign';
    public const UPDATE_STATUS = 'update_status';

    protected function supports(string $attribute, $subject): bool
    {
        if (in_array($attribute, [self::CREATE], true) && $subject === null) {
            return true;
        }

        if (! $subject instanceof Report) {
            return false;
        }

        return in_array($attribute, [self::VIEW, self::EDIT, self::ASSIGN, self::UPDATE_STATUS], true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?\Symfony\Component\Security\Core\Authorization\Voter\Vote $vote = null): bool
    {
        $user = $token->getUser();
        if (! $user instanceof UserInterface) {
            return false;
        }

        // ADMIN can do everything (supervisor-equivalent)
        if (in_array('ROLE_ADMIN', $user->getRoles(), true) || in_array('ROLE_SUPER_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        switch ($attribute) {
            case self::CREATE:
                // Citizens can create
                return in_array('ROLE_CITIZEN', $user->getRoles(), true);

            case self::VIEW:
                // Citizens can view their own reports; agents/admins handled above
                return $this->isOwner($subject, $user);

            case self::ASSIGN:
                // only ADMIN handled above can assign
                return false;

            case self::UPDATE_STATUS:
                // Agents can only update status on reports assigned to them
                if (in_array('ROLE_AGENT', $user->getRoles(), true)) {
                    $assignment = $subject->getAssignment();
                    if ($assignment && $assignment->getAssignedAgent() && $assignment->getAssignedAgent()->getId() === $user->getId()) {
                        return true;
                    }
                }

                return false;

            case self::EDIT:
                // Allow creator to edit while in PENDING or UNDER_REVIEW
                return $this->isOwner($subject, $user) && in_array($subject->getStatus()->value, [\App\Enum\ReportStatus::PENDING->value, \App\Enum\ReportStatus::UNDER_REVIEW->value], true);
        }

        return false;
    }

    private function isOwner(Report $report, UserInterface $user): bool
    {
        $creator = $report->getCreator();
        if (! $creator instanceof User) {
            return false;
        }

        return $creator->getId() === $user->getId();
    }
}
