<?php

declare(strict_types=1);

namespace App\Enum;

enum UserRole: string
{
    case CITIZEN = 'ROLE_CITIZEN';
    case AGENT = 'ROLE_AGENT';
    case ADMIN = 'ROLE_ADMIN';
    case SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
}
