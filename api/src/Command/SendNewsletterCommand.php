<?php

namespace App\Command;

use App\Service\UserService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

#[AsCommand(
    name: 'app:send-newsletter',
    description: 'Command to send an email to all active users created in the last week',
)]
class SendNewsletterCommand extends Command
{

    public function __construct(
        private UserService $userService,
        private MailerInterface $mailer
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $lastWeek = new \DateTime('-1 week');
            $users = $this->userService->getActiveUsersCreatedSince($lastWeek);

            if (empty($users)) {
                $io->info('No users found for newsletter sending.');
                return Command::SUCCESS;
            }

            $emailsSent = 0;
            foreach ($users as $user) {
                $email = (new Email())
                    ->from('cobbleweb@example.com')
                    ->to($user->getEmail())
                    ->subject('Your best newsletter')
                    ->html($this->getEmailContent($user));

                $this->mailer->send($email);
                $emailsSent++;
            }

            $io->success(sprintf('Newsletter sent successfully to %d users.', $emailsSent));
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $io->error('An error occurred while sending newsletters: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function getEmailContent($user): string
    {
        return "
            <html>
            <body>
                <h2>Hello {$user->getFirstName()},</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id interdum nibh. 
                Phasellus blandit tortor in cursus convallis. Praesent et tellus fermentum, 
                pellentesque lectus at, tincidunt risus. Quisque in nisl malesuada, aliquet nibh at, 
                molestie libero.</p>
            </body>
            </html>
        ";
    }
}