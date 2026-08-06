<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\UnencryptedToken;
use Lcobucci\JWT\Validation\Constraint\SignedWith;

class JwtManager
{
    private Configuration $config;

    public function __construct(
        private readonly string $secret,
        private readonly int $ttl = 3600,
    ) {
        $key = InMemory::plainText($this->normalizeSecret($secret));
        $this->config = Configuration::forSymmetricSigner(new Sha256(), $key);
        $this->config->setValidationConstraints(
            new SignedWith($this->config->signer(), $this->config->signingKey()),
        );
    }

    public function createToken(User $user): string
    {
        $now = new DateTimeImmutable();
        $token = $this->config->builder()
            ->issuedBy('smartcity')
            ->identifiedBy(uniqid('', true))
            ->issuedAt($now)
            ->canOnlyBeUsedAfter($now)
            ->expiresAt($now->modify("+{$this->ttl} seconds"))
            ->relatedTo((string) $user->getId())
            ->withClaim('email', $user->getEmail())
            ->withClaim('roles', $user->getRoles())
            ->getToken($this->config->signer(), $this->config->signingKey());

        return $token->toString();
    }

    public function parseToken(string $jwt): ?UnencryptedToken
    {
        try {
            $token = $this->config->parser()->parse($jwt);
            if (!$token instanceof UnencryptedToken) {
                return null;
            }

            $constraints = $this->config->validationConstraints();
            if (!$this->config->validator()->validate($token, ...$constraints)) {
                return null;
            }

            $expiresAt = $token->claims()->get('exp');
            if ($expiresAt instanceof DateTimeImmutable && $expiresAt < new DateTimeImmutable()) {
                return null;
            }

            return $token;
        } catch (\Throwable) {
            return null;
        }
    }

    private function normalizeSecret(string $secret): string
    {
        if (strlen($secret) >= 32) {
            return $secret;
        }

        return str_pad($secret, 32, '0');
    }
}
