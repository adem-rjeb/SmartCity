<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Municipality;
use App\Entity\User;
use App\Enum\UserRole;
use App\Entity\Category;
use App\Enum\ReportPriority;
use App\Entity\Report;
use App\Enum\ReportStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $hasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        $municipality = new Municipality('Tunis', 'Tunis', 'TN-01');
        $manager->persist($municipality);

        $admin = new User('Admin', 'admin@example.com', '', UserRole::SUPER_ADMIN);
        $admin->setPassword($this->hasher->hashPassword($admin, 'password'));
        $admin->setMunicipality($municipality);
        $manager->persist($admin);

        $agent = new User('Agent', 'agent@example.com', '', UserRole::AGENT);
        $agent->setPassword($this->hasher->hashPassword($agent, 'password'));
        $agent->setMunicipality($municipality);
        $manager->persist($agent);

        $citizen = new User('Citizen', 'citizen@example.com', '', UserRole::CITIZEN);
        $citizen->setPassword($this->hasher->hashPassword($citizen, 'password'));
        $citizen->setMunicipality($municipality);
        $manager->persist($citizen);

        $admin2 = new User('Admin2', 'admin2@example.com', '', UserRole::ADMIN);
        $admin2->setPassword($this->hasher->hashPassword($admin2, 'password'));
        $admin2->setMunicipality($municipality);
        $manager->persist($admin2);

        $cat1 = new Category('Pothole', ReportPriority::MEDIUM);
        $cat1->setDescription('Road surface damage');
        $manager->persist($cat1);

        $cat2 = new Category('Streetlight', ReportPriority::LOW);
        $cat2->setDescription('Broken streetlight');
        $manager->persist($cat2);

        $cat3 = new Category('Garbage', ReportPriority::HIGH);
        $cat3->setDescription('Overflowing trash');
        $manager->persist($cat3);

        $r1 = new Report('Pothole on Main', 'Large pothole', 'Rue 1', 36.81897, 10.16579, ReportStatus::PENDING, ReportPriority::MEDIUM);
        $r1->setCategory($cat1);
        $r1->setCreator($citizen);
        $manager->persist($r1);

        $r2 = new Report('Streetlight out', 'Light is off', 'Rue 2', 36.819, 10.166, ReportStatus::UNDER_REVIEW, ReportPriority::LOW);
        $r2->setCategory($cat2);
        $r2->setCreator($citizen);
        $manager->persist($r2);

        $r3 = new Report('Trash overflow', 'Bin full', 'Rue 3', 36.820, 10.167, ReportStatus::ASSIGNED, ReportPriority::HIGH);
        $r3->setCategory($cat3);
        $r3->setCreator($citizen);
        $manager->persist($r3);

        $r4 = new Report('Pothole near park', 'Small pothole', 'Rue 4', 36.821, 10.168, ReportStatus::RESOLVED, ReportPriority::LOW);
        $r4->setCategory($cat1);
        $r4->setCreator($citizen);
        $manager->persist($r4);

        $r5 = new Report('Another pothole', 'Medium pothole', 'Rue 5', 36.822, 10.169, ReportStatus::CLOSED, ReportPriority::LOW);
        $r5->setCategory($cat1);
        $r5->setCreator($citizen);
        $manager->persist($r5);

        $manager->flush();
    }
}
