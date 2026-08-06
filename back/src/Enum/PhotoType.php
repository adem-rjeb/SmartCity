<?php

declare(strict_types=1);

namespace App\Enum;

enum PhotoType: string
{
    case BEFORE = 'BEFORE';
    case AFTER = 'AFTER';
    case OTHER = 'OTHER';
}
