<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\Assignment;
use App\Entity\AuditLog;
use App\Entity\Category;
use App\Entity\Report;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\OnFlushEventArgs;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Events;
use Doctrine\ORM\UnitOfWork;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Writes AuditLog rows for create/update/delete of core entities.
 */
#[AsDoctrineListener(event: Events::onFlush)]
#[AsDoctrineListener(event: Events::postFlush)]
final class AuditLogSubscriber
{
    /** @var list<array{action: string, entity: object, details: ?string}> */
    private array $pending = [];

    private bool $flushing = false;

    public function __construct(
        private readonly Security $security,
    ) {
    }

    public function onFlush(OnFlushEventArgs $args): void
    {
        if ($this->flushing) {
            return;
        }

        $em = $args->getObjectManager();
        $uow = $em->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            $this->queue($entity, 'CREATE', $uow);
        }
        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            $this->queue($entity, 'UPDATE', $uow);
        }
        foreach ($uow->getScheduledEntityDeletions() as $entity) {
            $this->queue($entity, 'DELETE', $uow);
        }
    }

    public function postFlush(PostFlushEventArgs $args): void
    {
        if ($this->flushing || $this->pending === []) {
            return;
        }

        $em = $args->getObjectManager();
        $entries = $this->pending;
        $this->pending = [];
        $this->flushing = true;

        try {
            $user = $this->security->getUser();
            foreach ($entries as $entry) {
                $entity = $entry['entity'];
                $id = method_exists($entity, 'getId') ? $entity->getId() : null;
                $log = new AuditLog(
                    $entry['action'],
                    (new \ReflectionClass($entity))->getShortName(),
                    $id !== null ? (string) $id : 'unknown',
                );
                $log->setDetails($entry['details']);
                if ($user instanceof User) {
                    $log->setUser($user);
                }
                $em->persist($log);
            }
            $em->flush();
        } finally {
            $this->flushing = false;
        }
    }

    private function queue(object $entity, string $action, UnitOfWork $uow): void
    {
        if ($entity instanceof AuditLog || !$this->isTracked($entity)) {
            return;
        }

        $details = null;
        if ($action === 'UPDATE') {
            $changes = $uow->getEntityChangeSet($entity);
            unset($changes['password'], $changes['plainPassword']);
            if ($changes !== []) {
                $details = json_encode(array_keys($changes), JSON_THROW_ON_ERROR);
            }
        } elseif ($action === 'CREATE' && method_exists($entity, 'getNom')) {
            $details = 'nom=' . $entity->getNom();
        } elseif ($action === 'CREATE' && method_exists($entity, 'getTitre')) {
            $details = 'titre=' . $entity->getTitre();
        }

        $this->pending[] = [
            'action' => $action,
            'entity' => $entity,
            'details' => $details,
        ];
    }

    private function isTracked(object $entity): bool
    {
        return $entity instanceof User
            || $entity instanceof Category
            || $entity instanceof Report
            || $entity instanceof Assignment;
    }
}
