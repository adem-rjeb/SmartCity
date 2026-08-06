<?php

declare(strict_types=1);

namespace App\Security;

use App\Repository\UserRepository;
use App\Service\JwtManager;
use Lcobucci\JWT\UnencryptedToken;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

class JwtAuthenticator extends AbstractAuthenticator implements AuthenticationEntryPointInterface
{
    public function __construct(
        private readonly JwtManager $jwtManager,
        private readonly UserRepository $userRepository,
    ) {
    }

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('Authorization')
            && str_starts_with((string) $request->headers->get('Authorization'), 'Bearer ');
    }

    public function authenticate(Request $request): Passport
    {
        $auth = (string) $request->headers->get('Authorization');
        $jwt = substr($auth, 7);

        $token = $this->jwtManager->parseToken($jwt);

        if (!$token instanceof UnencryptedToken) {
            throw new AuthenticationException('Invalid JWT token');
        }

        $sub = $token->claims()->get('sub');
        if (!$sub) {
            throw new AuthenticationException('JWT does not contain subject (user id)');
        }

        return new SelfValidatingPassport(new UserBadge((string) $sub, function (string $id) {
            $user = $this->userRepository->find((int) $id);
            if (!$user) {
                throw new AuthenticationException('User not found');
            }

            return $user;
        }));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['error' => $exception->getMessageKey()], Response::HTTP_UNAUTHORIZED);
    }

    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return new JsonResponse(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
    }
}
