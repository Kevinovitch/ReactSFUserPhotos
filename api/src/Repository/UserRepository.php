<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Find active users created since given date
     *
     * @param \DateTime $since
     * @return User[]
     */
    public function findActiveUsersCreatedSince(\DateTime $since): array
    {
        return $this->createQueryBuilder('u')
            ->where('u.active = :active')
            ->andWhere('u.createdAt >= :since')
            ->setParameter('active', true)
            ->setParameter('since', $since)
            ->getQuery()
            ->getResult();
    }
}