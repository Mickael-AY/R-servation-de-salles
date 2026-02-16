-- ============================================
-- MPD - Reservation de Salles
-- TechSpace Solutions
-- MySQL 8 | UTF8MB4
-- Date : 16/02/2026
-- ============================================

-- Creation de la base de donnees
CREATE DATABASE IF NOT EXISTS reservation_salles
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE reservation_salles;

-- ============================================
-- TABLE : users
-- Stocke les collaborateurs de TechSpace
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================
-- TABLE : reservations
-- Stocke les reservations de la salle
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Cle etrangere vers users
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Index pour les performances
    INDEX idx_date (date),
    INDEX idx_user_id (user_id),
    INDEX idx_date_times (date, start_time, end_time)
) ENGINE=InnoDB;
