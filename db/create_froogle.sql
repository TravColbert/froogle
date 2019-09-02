-- sqlite3 froogle.db

CREATE TABLE `domains` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
  `name` VARCHAR(255) NOT NULL UNIQUE, 
  `description` VARCHAR(255), 
  `appid` VARCHAR(255), 
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  `ownerId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE `categories` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
  `name` VARCHAR(255), 
  `description` TEXT, 
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  `domainId` INTEGER REFERENCES `domains` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE `expenses` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
  `date` DATETIME, 
  `amount` DECIMAL, 
  `provider` VARCHAR(255), 
  `note` VARCHAR(255), 
  `public` TINYINT(1) DEFAULT 0, 
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  `categoryId` INTEGER REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, 
  `userId` INTEGER REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, 
  `domainId` INTEGER REFERENCES `domains` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);
