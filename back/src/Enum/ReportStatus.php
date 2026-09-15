<?php

declare(strict_types=1);

namespace App\Enum;

enum ReportStatus: string
{
    case PENDING = 'PENDING';
    case UNDER_REVIEW = 'UNDER_REVIEW';
    case ASSIGNED = 'ASSIGNED';
    case IN_PROGRESS = 'IN_PROGRESS';
    case RESOLVED = 'RESOLVED';
    case ESCALATED = 'ESCALATED';
    case REJECTED = 'REJECTED';
    case CLOSED = 'CLOSED';
}
