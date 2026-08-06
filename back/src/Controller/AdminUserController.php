<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Enum\UserRole;
use App\Entity\Municipality;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AdminUserController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $hasher,
    ) {
    }

    #[Route('/api/admin_users', name: 'api_admin_users_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent() ?: '{}', true);

        if (!is_array($data)) {
            return new JsonResponse(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        $required = ['email', 'nom', 'role'];
        foreach ($required as $r) {
            if (empty($data[$r])) {
                return new JsonResponse(['error' => "Missing $r"], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $user = new User();
        $user->setNom((string)$data['nom']);
        $user->setEmail((string)$data['email']);

        try {
            $user->setRole(UserRole::from((string)$data['role']));
        } catch (\Throwable $e) {
            // fallback to CITIZEN
            $user->setRole(UserRole::CITIZEN);
        }

        // municipality can be an IRI
        if (!empty($data['municipality']) && is_string($data['municipality'])) {
            // municipality may be an IRI like /api/municipalities/1 — extract id
            if (preg_match('#/(\d+)$#', $data['municipality'], $m)) {
                $mun = $this->em->getRepository(Municipality::class)->find((int)$m[1]);
                if ($mun) {
                    $user->setMunicipality($mun);
                }
            }
        }

        // Allow admin to omit plainPassword — generate a secure random one and
        // return it in the response so the admin can communicate it to the user.
        $plain = !empty($data['plainPassword']) ? (string)$data['plainPassword'] : bin2hex(random_bytes(6));
        $hashed = $this->hasher->hashPassword($user, $plain);
        $user->setPassword($hashed);

        $this->em->persist($user);
        $this->em->flush();

        $iri = '/api/users/' . $user->getId();

        return new JsonResponse(['@id' => $iri, 'password' => $plain], Response::HTTP_CREATED, ['Location' => $iri]);
    }
}
