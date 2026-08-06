<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260722193420 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE assignment (id INT AUTO_INCREMENT NOT NULL, status VARCHAR(255) NOT NULL, commentaire LONGTEXT DEFAULT NULL, assigned_at DATETIME NOT NULL, completed_at DATETIME DEFAULT NULL, report_id INT DEFAULT NULL, assigned_agent_id INT DEFAULT NULL, assigned_by_id INT DEFAULT NULL, INDEX IDX_30C544BA4BD2A4C0 (report_id), INDEX IDX_30C544BA49197702 (assigned_agent_id), INDEX IDX_30C544BA6E6F1246 (assigned_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE audit_log (id INT AUTO_INCREMENT NOT NULL, action VARCHAR(255) NOT NULL, entity_name VARCHAR(255) NOT NULL, entity_id VARCHAR(255) NOT NULL, details LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT DEFAULT NULL, INDEX IDX_F6E1C0F5A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE category (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, description VARCHAR(1024) DEFAULT NULL, icon VARCHAR(255) DEFAULT NULL, priorite_par_defaut VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE comment (id INT AUTO_INCREMENT NOT NULL, contenu LONGTEXT NOT NULL, created_at DATETIME NOT NULL, report_id INT DEFAULT NULL, user_id INT DEFAULT NULL, INDEX IDX_9474526C4BD2A4C0 (report_id), INDEX IDX_9474526CA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE municipality (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, gouvernorat VARCHAR(255) NOT NULL, code VARCHAR(64) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, message LONGTEXT NOT NULL, is_read TINYINT NOT NULL, created_at DATETIME NOT NULL, report_id INT DEFAULT NULL, recipient_id INT DEFAULT NULL, INDEX IDX_BF5476CA4BD2A4C0 (report_id), INDEX IDX_BF5476CAE92F8F78 (recipient_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE report (id INT AUTO_INCREMENT NOT NULL, titre VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, adresse VARCHAR(512) NOT NULL, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, status VARCHAR(255) NOT NULL, priority VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, resolved_at DATETIME DEFAULT NULL, category_id INT DEFAULT NULL, creator_id INT DEFAULT NULL, INDEX IDX_C42F778412469DE2 (category_id), INDEX IDX_C42F778461220EA6 (creator_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE report_photo (id INT AUTO_INCREMENT NOT NULL, url VARCHAR(1024) NOT NULL, type VARCHAR(255) NOT NULL, uploaded_at DATETIME NOT NULL, report_id INT DEFAULT NULL, INDEX IDX_3EAB83614BD2A4C0 (report_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE status_history (id INT AUTO_INCREMENT NOT NULL, old_status VARCHAR(255) NOT NULL, new_status VARCHAR(255) NOT NULL, changed_at DATETIME NOT NULL, report_id INT DEFAULT NULL, changed_by_id INT DEFAULT NULL, INDEX IDX_2F6A07CE4BD2A4C0 (report_id), INDEX IDX_2F6A07CE828AD0A0 (changed_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(180) NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, municipality_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), INDEX IDX_8D93D649AE6F181C (municipality_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE assignment ADD CONSTRAINT FK_30C544BA4BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id)');
        $this->addSql('ALTER TABLE assignment ADD CONSTRAINT FK_30C544BA49197702 FOREIGN KEY (assigned_agent_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE assignment ADD CONSTRAINT FK_30C544BA6E6F1246 FOREIGN KEY (assigned_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE audit_log ADD CONSTRAINT FK_F6E1C0F5A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526C4BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id)');
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526CA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CA4BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id)');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAE92F8F78 FOREIGN KEY (recipient_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F778412469DE2 FOREIGN KEY (category_id) REFERENCES category (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F778461220EA6 FOREIGN KEY (creator_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE report_photo ADD CONSTRAINT FK_3EAB83614BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id)');
        $this->addSql('ALTER TABLE status_history ADD CONSTRAINT FK_2F6A07CE4BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id)');
        $this->addSql('ALTER TABLE status_history ADD CONSTRAINT FK_2F6A07CE828AD0A0 FOREIGN KEY (changed_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649AE6F181C FOREIGN KEY (municipality_id) REFERENCES municipality (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE assignment DROP FOREIGN KEY FK_30C544BA4BD2A4C0');
        $this->addSql('ALTER TABLE assignment DROP FOREIGN KEY FK_30C544BA49197702');
        $this->addSql('ALTER TABLE assignment DROP FOREIGN KEY FK_30C544BA6E6F1246');
        $this->addSql('ALTER TABLE audit_log DROP FOREIGN KEY FK_F6E1C0F5A76ED395');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526C4BD2A4C0');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CA76ED395');
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_BF5476CA4BD2A4C0');
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_BF5476CAE92F8F78');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F778412469DE2');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F778461220EA6');
        $this->addSql('ALTER TABLE report_photo DROP FOREIGN KEY FK_3EAB83614BD2A4C0');
        $this->addSql('ALTER TABLE status_history DROP FOREIGN KEY FK_2F6A07CE4BD2A4C0');
        $this->addSql('ALTER TABLE status_history DROP FOREIGN KEY FK_2F6A07CE828AD0A0');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D649AE6F181C');
        $this->addSql('DROP TABLE assignment');
        $this->addSql('DROP TABLE audit_log');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE comment');
        $this->addSql('DROP TABLE municipality');
        $this->addSql('DROP TABLE notification');
        $this->addSql('DROP TABLE report');
        $this->addSql('DROP TABLE report_photo');
        $this->addSql('DROP TABLE status_history');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
