<?php

namespace App\Entity;

use App\Repository\UserRepository;
use JetBrains\PhpStorm\Pure;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;


#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[UniqueEntity(fields: ['email'], message: 'This email is already used.')]
class User implements \JsonSerializable, UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Assert\Length(
        min: 2,
        max: 25,
        minMessage: 'The firstName must be at least {{ limit }} characters long',
        maxMessage: 'The firstName cannot be longer than {{ limit }} characters',
    )]
    #[ORM\Column]
    private ?string $firstName = null;

    #[Assert\Length(
        min: 2,
        max: 25,
        minMessage: 'The lastName must be at least {{ limit }} characters long',
        maxMessage: 'The lastName cannot be longer than {{ limit }} characters',
    )]
    #[ORM\Column]
    private ?string $lastName = null;


    #[ORM\Column(length: 255)]
    private ?string $fullName = null;

    #[Assert\Email(
        message: 'The email {{ value }} is not a valid email.',
    )]
    #[ORM\Column(unique: true)]
    private ?string $email = null;

    #[Assert\Regex(
        pattern: '/^(?=.*[0-9]).{6,50}$/',
        message: 'The password must contain a number and its length must be between 6 and 50 characters',
        match: true,
    )]
    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column]
    private ?bool $active;

    #[Assert\Url]
    #[ORM\Column(length: 255)]
    private ?string $avatar = null;

    #[ORM\OneToMany(targetEntity: Photo::class, mappedBy: 'user')]
    private Collection $photos;

    #[ORM\Column(type: 'json')]
    private ?array $roles = [];


    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

    #[Pure] public function __construct()
    {
        $this->photos = new ArrayCollection();
        $this->active = true;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getFullName(): ?string
    {
        return $this->fullName;
    }


    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function updateFullName(): void
    {
        $this->fullName = $this->firstName . ' ' . $this->lastName;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(bool $active): static
    {
        $this->active = $active;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(string $avatar): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    /**
     * @return Collection
     */
    public function getPhotos(): Collection
    {
        return $this->photos;
    }

    public function addPhoto(Photo $photo): static
    {
        if (!$this->photos->contains($photo)) {
            $this->photos->add($photo);
            $photo->setUser($this);
        }

        return $this;
    }

    public function removePhoto(Photo $photo): static
    {
        if ($this->photos->removeElement($photo)) {
            // set the owning side to null (unless already changed)
            if ($photo->getUser() === $this) {
                $photo->setUser(null);
            }
        }

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }


    /***
     * Method to convert entity User into serialized Data in
     * order to be able to be seen in a jsonResponse
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'fullName' => $this->fullName,
            'email' => $this->email,
            'password' => $this->password,
            'active' => $this->active,
            'avatar' => $this->avatar,
            'photos' => array_map(function(Photo $photo) {
                return [
                    'id' => $photo->getId(),
                    'name' => $photo->getName(),
                    'url' => $photo->getUrl(),
                    'createdAt' => $photo->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updatedAt' => $photo->getUpdatedAt()->format('Y-m-d H:i:s')
                ];
            }, $this->getPhotos()->toArray()),
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s')
        ];
    }

    public function addRole(string $role): self
    {
        if (!in_array($role, $this->roles, true)) {
            $this->roles[] = $role;
        }

        return $this;
    }

    public function getRoles(): array
    {
        $roles[] = $this->roles;

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function eraseCredentials() : void
    {
        // TODO: Implement eraseCredentials() method.
    }

    #[Pure] public function getUserIdentifier(): string
    {
        return $this->getEmail();
    }
}
