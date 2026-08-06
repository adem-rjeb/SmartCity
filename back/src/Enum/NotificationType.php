<?php

declare(strict_types=1);

namespace App\Enum;

enum NotificationType: string
{
    case REPORT_CREATED = 'REPORT_CREATED';
    case STATUS_CHANGED = 'STATUS_CHANGED';
    case ASSIGNMENT = 'ASSIGNMENT';
    case COMMENT = 'COMMENT';
    case SYSTEM = 'SYSTEM';
}
